from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.db.models import Count, Prefetch, Q
from django.utils import timezone

from api.modules.inventory.models import InventoryCategory, InventoryItem, InventoryMovement
from api.modules.plants.models import Farm, Greenhouse, HarvestHistoryEntry, Plant, PlantStage, Plot
from api.modules.tasks.models import (
    RecurringTaskPlan,
    ResourceUsageEntry,
    Task,
    TaskAssignmentRecord,
    TaskCommentRecord,
    TaskHistoryEntry,
)


User = get_user_model()


def aware_datetime(value):
    if value is None:
        return timezone.now()
    if timezone.is_naive(value):
        return timezone.make_aware(value, timezone.get_current_timezone())
    return value


def users_queryset():
    return User.objects.order_by("full_name", "email")


def workers_queryset():
    return users_queryset().filter(role="worker")


def farms_queryset():
    return Farm.objects.order_by("name")


def inventory_categories_queryset():
    return InventoryCategory.objects.order_by("name")


def plant_stages_queryset():
    return PlantStage.objects.order_by("sort_order", "name")


def all_plant_stages_queryset():
    return PlantStage.objects.all()


def plants_queryset():
    return (
        Plant.objects.select_related(
            "stage",
            "plot__farm",
            "greenhouse__farm",
        )
        .prefetch_related(
            Prefetch("harvest_history", queryset=HarvestHistoryEntry.objects.select_related("recorded_by")),
            Prefetch("resource_usage", queryset=ResourceUsageEntry.objects.select_related("recorded_by", "task")),
            Prefetch("tasks", queryset=Task.objects.select_related("recurring_series").order_by("-scheduled_start_at")),
            "recurring_series",
        )
        .annotate(
            active_tasks_count=Count(
                "tasks",
                filter=Q(
                    tasks__status__in=[
                        "scheduled",
                        "in_progress",
                        "completed_pending_confirmation",
                        "postponed",
                    ]
                ),
                distinct=True,
            ),
            recurring_series_count=Count(
                "recurring_series",
                filter=Q(recurring_series__is_active=True),
                distinct=True,
            ),
        )
    )


def filter_plants(queryset, params):
    if status_value := params.get("status"):
        queryset = queryset.filter(status=status_value)
    if stage := params.get("stage"):
        queryset = queryset.filter(stage_id=stage)
    if farm := params.get("farm"):
        queryset = queryset.filter(Q(plot__farm_id=farm) | Q(greenhouse__farm_id=farm))
    if area_type := params.get("area_type"):
        if area_type == "plot":
            queryset = queryset.filter(plot__isnull=False)
        elif area_type == "greenhouse":
            queryset = queryset.filter(greenhouse__isnull=False)
    if plot := params.get("plot"):
        queryset = queryset.filter(plot_id=plot)
    if greenhouse := params.get("greenhouse"):
        queryset = queryset.filter(greenhouse_id=greenhouse)
    if search := params.get("search"):
        queryset = queryset.filter(Q(name__icontains=search) | Q(variety__icontains=search))
    if expected_from := params.get("expected_from"):
        queryset = queryset.filter(expected_harvest_date__gte=expected_from)
    if expected_to := params.get("expected_to"):
        queryset = queryset.filter(expected_harvest_date__lte=expected_to)
    return queryset.distinct()


def get_plant(pk):
    return plants_queryset().get(pk=pk)


def all_plants_queryset():
    return Plant.objects.all()


def plot_has_other_plant(plot, instance=None):
    occupant = Plant.objects.filter(plot=plot)
    if instance:
        occupant = occupant.exclude(pk=instance.pk)
    return occupant.exists()


def plots_queryset():
    return Plot.objects.select_related("farm").prefetch_related("plants__stage").order_by("farm__name", "name")


def all_plots_queryset():
    return Plot.objects.all()


def get_plot(pk):
    return plots_queryset().get(pk=pk)


def greenhouses_queryset():
    return (
        Greenhouse.objects.select_related("farm")
        .prefetch_related("plants__stage")
        .order_by("farm__name", "name")
    )


def all_greenhouses_queryset():
    return Greenhouse.objects.all()


def get_greenhouse(pk):
    return greenhouses_queryset().get(pk=pk)


def harvest_history_queryset():
    return HarvestHistoryEntry.objects.select_related("plant", "recorded_by").order_by("-harvested_at", "-id")


def get_harvest_history_entry(pk):
    return harvest_history_queryset().get(pk=pk)


def plant_harvest_history(plant):
    return plant.harvest_history.select_related("recorded_by")


def resource_usage_queryset():
    return ResourceUsageEntry.objects.select_related("plant", "task", "recorded_by").order_by("-used_at", "-id")


def get_resource_usage_entry(pk):
    return resource_usage_queryset().get(pk=pk)


def plant_resource_usage(plant):
    return plant.resource_usage.select_related("recorded_by", "task")


def task_resource_usage(task):
    return ResourceUsageEntry.objects.filter(task=task).order_by("-used_at")


def inventory_items_queryset():
    return (
        InventoryItem.objects.select_related("farm", "category")
        .prefetch_related(
            Prefetch(
                "movements",
                queryset=InventoryMovement.objects.select_related(
                    "inventory_item__farm",
                    "inventory_item__category",
                    "task",
                    "plant",
                    "created_by",
                ).order_by("-movement_date", "-id"),
            )
        )
        .order_by("farm__name", "name")
    )


def get_inventory_item(pk):
    return inventory_items_queryset().get(pk=pk)


def filter_inventory_items(queryset, params):
    if status_value := params.get("status"):
        queryset = queryset.filter(status=status_value)
    if farm := params.get("farm"):
        queryset = queryset.filter(farm_id=farm)
    if category := params.get("category"):
        queryset = queryset.filter(category_id=category)
    if params.get("low_stock") == "true":
        queryset = queryset.filter(current_quantity__lte=models.F("low_stock_threshold"))
    if params.get("show_archived") != "true":
        queryset = queryset.exclude(status="archived")
    if search := params.get("search"):
        queryset = queryset.filter(
            Q(name__icontains=search)
            | Q(storage_location__icontains=search)
            | Q(notes__icontains=search)
            | Q(category__name__icontains=search)
            | Q(farm__name__icontains=search)
        )
    return queryset.distinct()


def inventory_movements_queryset():
    return (
        InventoryMovement.objects.select_related(
            "inventory_item__farm",
            "inventory_item__category",
            "task",
            "plant",
            "created_by",
        )
        .order_by("-movement_date", "-id")
    )


def get_inventory_movement(pk):
    return inventory_movements_queryset().get(pk=pk)


def filter_inventory_movements(queryset, params):
    if item := params.get("item"):
        queryset = queryset.filter(inventory_item_id=item)
    if farm := params.get("farm"):
        queryset = queryset.filter(inventory_item__farm_id=farm)
    if movement_type := params.get("movement_type"):
        queryset = queryset.filter(movement_type=movement_type)
    if plant := params.get("plant"):
        queryset = queryset.filter(plant_id=plant)
    if task := params.get("task"):
        queryset = queryset.filter(task_id=task)
    if date_from := params.get("date_from"):
        queryset = queryset.filter(movement_date__date__gte=date_from)
    if date_to := params.get("date_to"):
        queryset = queryset.filter(movement_date__date__lte=date_to)
    if search := params.get("search"):
        queryset = queryset.filter(
            Q(inventory_item__name__icontains=search)
            | Q(inventory_item__category__name__icontains=search)
            | Q(note__icontains=search)
            | Q(plant__name__icontains=search)
            | Q(task__title__icontains=search)
        )
    return queryset.distinct()


def inventory_item_delete_impact(item):
    return {
        "inventory_items": 1,
        "inventory_movements": item.movements.count(),
    }


@transaction.atomic
def delete_inventory_item(item):
    impact = inventory_item_delete_impact(item)
    item.delete()
    return impact


def _movement_delta(movement_type, quantity, current_quantity=None):
    if movement_type == "stock_in":
        return quantity
    if movement_type in ["stock_out", "waste"]:
        return -quantity
    if movement_type == "adjustment":
        if current_quantity is None:
            raise ValidationError("Adjustment requires current quantity.")
        return quantity - current_quantity
    return quantity


def _validate_inventory_level(item, delta):
    if item.current_quantity + delta < 0:
        raise ValidationError(f"Movement would reduce {item.name} below zero.")


@transaction.atomic
def create_inventory_movement(validated_data):
    created_by_id = validated_data.pop("created_by_id", None)
    item = validated_data["inventory_item"]
    delta = _movement_delta(validated_data["movement_type"], validated_data["quantity"], item.current_quantity)
    _validate_inventory_level(item, delta)
    item.current_quantity += delta
    item.save(update_fields=["current_quantity", "updated_at"])
    return InventoryMovement.objects.create(created_by_id=created_by_id, **validated_data)


@transaction.atomic
def update_inventory_movement(movement, validated_data):
    original_type = movement.movement_type
    next_type = validated_data.get("movement_type", original_type)
    if original_type == "adjustment" or next_type == "adjustment":
        raise ValidationError("Adjustment movements cannot be edited. Create a new adjustment instead.")

    item = validated_data.get("inventory_item", movement.inventory_item)
    if item.pk != movement.inventory_item_id:
        old_item = movement.inventory_item
        old_item.current_quantity -= _movement_delta(movement.movement_type, movement.quantity, old_item.current_quantity)
        _validate_inventory_level(old_item, 0)
        old_item.save(update_fields=["current_quantity", "updated_at"])

    current_item = item
    if current_item.pk == movement.inventory_item_id:
        reverse_delta = -_movement_delta(movement.movement_type, movement.quantity, current_item.current_quantity)
        apply_delta = _movement_delta(next_type, validated_data.get("quantity", movement.quantity), current_item.current_quantity + reverse_delta)
        final_delta = reverse_delta + apply_delta
        _validate_inventory_level(current_item, final_delta)
        current_item.current_quantity += final_delta
        current_item.save(update_fields=["current_quantity", "updated_at"])
    else:
        new_delta = _movement_delta(next_type, validated_data.get("quantity", movement.quantity), current_item.current_quantity)
        _validate_inventory_level(current_item, new_delta)
        current_item.current_quantity += new_delta
        current_item.save(update_fields=["current_quantity", "updated_at"])

    for field, value in validated_data.items():
        if field == "created_by_id":
            movement.created_by_id = value
        else:
            setattr(movement, field, value)
    movement.save()
    return movement


@transaction.atomic
def delete_inventory_movement(movement):
    if movement.movement_type == "adjustment":
        raise ValidationError("Adjustment movements cannot be deleted because they represent a stock reset.")
    item = movement.inventory_item
    delta = -_movement_delta(movement.movement_type, movement.quantity, item.current_quantity)
    _validate_inventory_level(item, delta)
    item.current_quantity += delta
    item.save(update_fields=["current_quantity", "updated_at"])
    movement.delete()
    return {"inventory_movements": 1, "inventory_items_updated": 1}


def inventory_dashboard(queryset):
    recent_movements = inventory_movements_queryset()[:10]
    low_stock_items = queryset.filter(current_quantity__lte=models.F("low_stock_threshold")).order_by(
        "current_quantity",
        "name",
    )[:8]
    category_counts = queryset.values("category__name").annotate(count=Count("id")).order_by("-count", "category__name")
    farm_counts = queryset.values("farm__name").annotate(count=Count("id")).order_by("-count", "farm__name")

    return {
        "summary": {
            "active_items": queryset.filter(status="active").count(),
            "low_stock_items": queryset.filter(current_quantity__lte=models.F("low_stock_threshold")).count(),
            "archived_items": queryset.filter(status="archived").count(),
            "total_movements": inventory_movements_queryset().count(),
        },
        "categories": [{"label": row["category__name"], "count": row["count"]} for row in category_counts],
        "farms": [{"label": row["farm__name"], "count": row["count"]} for row in farm_counts],
        "low_stock_items": [
            {
                "id": item.id,
                "name": item.name,
                "farm_name": item.farm.name,
                "category_name": item.category.name,
                "current_quantity": item.current_quantity,
                "low_stock_threshold": item.low_stock_threshold,
                "unit": item.unit,
            }
            for item in low_stock_items
        ],
        "recent_movements": [
            {
                "id": movement.id,
                "item_name": movement.inventory_item.name,
                "movement_type": movement.movement_type,
                "quantity": movement.quantity,
                "unit": movement.inventory_item.unit,
                "movement_date": movement.movement_date,
            }
            for movement in recent_movements
        ],
    }


@transaction.atomic
def save_serializer(serializer):
    return serializer.save()


def build_plant_delete_impact(plant):
    return {
        "plants": 1,
        "tasks": plant.tasks.count(),
        "task_assignments": sum(task.assignments.count() for task in plant.tasks.all()),
        "task_comments": sum(task.comments.count() for task in plant.tasks.all()),
        "task_history": sum(task.history_entries.count() for task in plant.tasks.all()),
        "recurring_series": plant.recurring_series.count(),
        "harvest_history": plant.harvest_history.count(),
        "resource_usage": plant.resource_usage.count(),
    }


def build_plot_delete_impact(plot):
    plants = plot.plants.all()
    return {
        "plots": 1,
        "plants": plants.count(),
        "tasks": sum(plant.tasks.count() for plant in plants),
        "recurring_series": sum(plant.recurring_series.count() for plant in plants),
        "harvest_history": sum(plant.harvest_history.count() for plant in plants),
        "resource_usage": sum(plant.resource_usage.count() for plant in plants),
    }


def build_greenhouse_delete_impact(greenhouse):
    plants = greenhouse.plants.all()
    return {
        "greenhouses": 1,
        "plants": plants.count(),
        "tasks": sum(plant.tasks.count() for plant in plants),
        "recurring_series": sum(plant.recurring_series.count() for plant in plants),
        "harvest_history": sum(plant.harvest_history.count() for plant in plants),
        "resource_usage": sum(plant.resource_usage.count() for plant in plants),
    }


@transaction.atomic
def delete_plant(plant):
    impact = build_plant_delete_impact(plant)
    plant.delete()
    return impact


@transaction.atomic
def delete_plot(plot):
    impact = build_plot_delete_impact(plot)
    plot.delete()
    return impact


@transaction.atomic
def delete_greenhouse(greenhouse):
    impact = build_greenhouse_delete_impact(greenhouse)
    greenhouse.delete()
    return impact


@transaction.atomic
def mark_plant_status(plant, status, note=""):
    plant.status = status
    if note:
        plant.notes = f"{plant.notes}\n{note}".strip()
    plant.save(update_fields=["status", "notes", "updated_at"])
    return plant


@transaction.atomic
def change_stage(plant, stage, note=""):
    plant.stage = stage
    if note:
        plant.notes = f"{plant.notes}\nStage change: {note}".strip()
    plant.save(update_fields=["stage", "notes", "updated_at"])
    return plant


def plants_dashboard(queryset):
    now = timezone.localdate()
    harvest_cutoff = now + timedelta(days=14)
    expected_harvest_soon = queryset.filter(
        status="active",
        expected_harvest_date__isnull=False,
        expected_harvest_date__lte=harvest_cutoff,
    ).order_by("expected_harvest_date")[:8]
    recent_harvest = HarvestHistoryEntry.objects.select_related("plant", "recorded_by").order_by("-harvested_at")[:8]
    recent_resources = ResourceUsageEntry.objects.select_related("plant", "task", "recorded_by").order_by("-used_at")[:8]

    by_stage = {}
    by_area = {"plots": 0, "greenhouses": 0}
    for plant in queryset:
        by_stage[plant.stage.name] = by_stage.get(plant.stage.name, 0) + 1
        if plant.area_type == "plot":
            by_area["plots"] += 1
        else:
            by_area["greenhouses"] += 1

    return {
        "summary": {
            "active_plants": queryset.filter(status="active").count(),
            "plants_near_harvest": expected_harvest_soon.count(),
            "harvested_plants": queryset.filter(status="harvested").count(),
            "failed_plants": queryset.filter(status="failed").count(),
            "plots_in_use": Plot.objects.filter(plants__isnull=False).distinct().count(),
            "greenhouses_in_use": Greenhouse.objects.filter(plants__isnull=False).distinct().count(),
        },
        "by_stage": [{"label": key, "count": value} for key, value in by_stage.items()],
        "by_area": [{"label": key, "count": value} for key, value in by_area.items()],
        "expected_harvest_soon": [
            {
                "id": plant.id,
                "name": plant.name,
                "variety": plant.variety,
                "expected_harvest_date": plant.expected_harvest_date,
                "area_name": plant.area.name if plant.area else "",
            }
            for plant in expected_harvest_soon
        ],
        "recent_harvest_records": [
            {
                "id": entry.id,
                "plant_name": entry.plant.name,
                "harvested_at": entry.harvested_at,
                "quantity": entry.quantity,
                "quantity_unit": entry.quantity_unit,
                "quality_grade": entry.quality_grade,
            }
            for entry in recent_harvest
        ],
        "recent_resource_usage": [
            {
                "id": entry.id,
                "plant_name": entry.plant.name,
                "resource_name": entry.resource_name,
                "resource_type": entry.resource_type,
                "used_at": entry.used_at,
                "quantity": entry.quantity,
                "quantity_unit": entry.quantity_unit,
            }
            for entry in recent_resources
        ],
    }


def tasks_queryset():
    return (
        Task.objects.select_related(
            "plant__stage",
            "plant__plot__farm",
            "plant__greenhouse__farm",
            "recurring_series",
            "created_by",
            "last_updated_by",
        )
        .prefetch_related(
            Prefetch("assignments", queryset=TaskAssignmentRecord.objects.select_related("worker", "assigned_by")),
            Prefetch("comments", queryset=TaskCommentRecord.objects.select_related("author")),
            Prefetch("history_entries", queryset=TaskHistoryEntry.objects.select_related("actor")),
        )
        .annotate(comments_count=Count("comments", distinct=True))
    )


def filter_tasks(queryset, params):
    if status_value := params.get("status"):
        queryset = queryset.filter(status=status_value)
    if priority := params.get("priority"):
        queryset = queryset.filter(priority=priority)
    if category := params.get("category"):
        queryset = queryset.filter(category=category)
    if worker := params.get("worker"):
        queryset = queryset.filter(assignments__worker_id=worker)
    if plant := params.get("plant"):
        queryset = queryset.filter(plant_id=plant)
    if area_type := params.get("area_type"):
        if area_type == "plot":
            queryset = queryset.filter(plant__plot__isnull=False)
        elif area_type == "greenhouse":
            queryset = queryset.filter(plant__greenhouse__isnull=False)
    if params.get("overdue") == "true":
        queryset = queryset.filter(scheduled_end_at__lt=params.get("reference_now")).exclude(
            status__in=["completed", "cancelled"]
        )
    if search := params.get("search"):
        queryset = queryset.filter(
            Q(title__icontains=search)
            | Q(description__icontains=search)
            | Q(plant__name__icontains=search)
            | Q(plant__variety__icontains=search)
        )
    if farm := params.get("farm"):
        queryset = queryset.filter(Q(plant__plot__farm_id=farm) | Q(plant__greenhouse__farm_id=farm))
    if date_from := params.get("date_from"):
        queryset = queryset.filter(scheduled_start_at__date__gte=date_from)
    if date_to := params.get("date_to"):
        queryset = queryset.filter(scheduled_end_at__date__lte=date_to)
    return queryset.distinct()


def recurring_task_series_queryset():
    return RecurringTaskPlan.objects.select_related("plant").order_by("title", "start_date")


def _history(task, action_type, actor_id=None, field_name="", old_value="", new_value="", action_note=""):
    actor = User.objects.filter(pk=actor_id).first() if actor_id else None
    return TaskHistoryEntry.objects.create(
        task=task,
        actor=actor,
        action_type=action_type,
        field_name=field_name,
        old_value=old_value,
        new_value=new_value,
        action_note=action_note,
    )


def assign_workers(task, worker_ids, assigned_by_id=None, note=""):
    TaskAssignmentRecord.objects.filter(task=task).exclude(worker_id__in=worker_ids).delete()
    existing = set(TaskAssignmentRecord.objects.filter(task=task).values_list("worker_id", flat=True))
    missing = [worker_id for worker_id in worker_ids if worker_id not in existing]
    TaskAssignmentRecord.objects.bulk_create(
        [TaskAssignmentRecord(task=task, worker_id=worker_id, assigned_by_id=assigned_by_id) for worker_id in missing]
    )
    _history(
        task,
        "assign",
        actor_id=assigned_by_id,
        new_value=", ".join(map(str, worker_ids)),
        action_note=note,
    )


def _build_series_from_recurrence(task, recurrence, actor_id=None):
    if not recurrence:
        return None

    series = RecurringTaskPlan.objects.create(
        plant=task.plant,
        title=task.title,
        description=task.description,
        category=task.category,
        priority=task.priority,
        frequency=recurrence["frequency"],
        interval_value=recurrence.get("interval_value", 1),
        weekdays_text=",".join(recurrence.get("weekdays", [])),
        start_date=recurrence["start_date"],
        end_date=recurrence.get("end_date"),
        time_of_day=recurrence["time_of_day"],
        default_duration_minutes=recurrence.get("default_duration_minutes", 60),
        required_items_text=task.required_items_text,
        is_active=recurrence.get("is_active", True),
        created_by_id=actor_id,
        last_updated_by_id=actor_id,
    )
    task.recurring_series = series
    task.save(update_fields=["recurring_series"])
    _history(task, "create_recurring_series", actor_id=actor_id, new_value=str(series.id))
    return series


@transaction.atomic
def create_task(validated_data):
    worker_ids = validated_data.pop("assigned_worker_ids", [])
    recurrence = validated_data.pop("recurrence", None)
    actor_id = getattr(validated_data.get("created_by"), "id", None)
    task = Task.objects.create(**validated_data)
    _history(task, "create", actor_id=actor_id)
    if worker_ids:
        assign_workers(task, worker_ids, actor_id)
    _build_series_from_recurrence(task, recurrence, actor_id=actor_id)
    return task


@transaction.atomic
def update_task(task, validated_data):
    worker_ids = validated_data.pop("assigned_worker_ids", None)
    recurrence = validated_data.pop("recurrence", None)
    scope = validated_data.pop("recurring_update_scope", "task_only")
    actor_id = getattr(validated_data.get("last_updated_by"), "id", None)

    tracked_fields = [
        "title",
        "description",
        "category",
        "priority",
        "scheduled_start_at",
        "scheduled_end_at",
        "manager_note",
        "plant",
    ]
    original = {field: getattr(task, field) for field in tracked_fields}

    for field, value in validated_data.items():
        setattr(task, field, value)
    task.save()

    for field in tracked_fields:
        old_value = original[field]
        new_value = getattr(task, field)
        if old_value != new_value:
            _history(
                task,
                "update",
                actor_id=actor_id,
                field_name=field,
                old_value=str(old_value),
                new_value=str(new_value),
            )

    if worker_ids is not None:
        assign_workers(task, worker_ids, actor_id)

    if recurrence and task.recurring_series:
        _update_series(task, recurrence, scope, actor_id=actor_id)
    elif recurrence:
        _build_series_from_recurrence(task, recurrence, actor_id=actor_id)

    return task


def _update_series(task, recurrence, scope, actor_id=None):
    series = task.recurring_series
    if not series or scope not in ["future", "full_setup"]:
        return

    series.title = task.title
    series.description = task.description
    series.category = task.category
    series.priority = task.priority
    series.frequency = recurrence["frequency"]
    series.interval_value = recurrence.get("interval_value", series.interval_value)
    series.weekdays_text = ",".join(recurrence.get("weekdays", []))
    series.start_date = recurrence["start_date"]
    series.end_date = recurrence.get("end_date")
    series.time_of_day = recurrence["time_of_day"]
    series.default_duration_minutes = recurrence.get("default_duration_minutes", series.default_duration_minutes)
    series.is_active = recurrence.get("is_active", series.is_active)
    series.last_updated_by_id = actor_id
    series.save()
    _history(task, "update_recurring_setup", actor_id=actor_id, action_note=scope)

    if scope == "future":
        future_tasks = series.tasks.filter(scheduled_start_at__gte=task.scheduled_start_at).exclude(pk=task.pk)
        duration = timedelta(minutes=series.default_duration_minutes)
        for future_task in future_tasks:
            future_task.title = task.title
            future_task.description = task.description
            future_task.category = task.category
            future_task.priority = task.priority
            future_task.required_items_text = task.required_items_text
            future_task.plant = task.plant
            future_task.scheduled_end_at = future_task.scheduled_start_at + duration
            future_task.save()


def task_delete_impact(task):
    future_tasks = (
        task.recurring_series.tasks.filter(scheduled_start_at__gte=task.scheduled_start_at).count()
        if task.recurring_series
        else 0
    )
    return {
        "tasks": 1,
        "future_recurring_tasks": max(future_tasks - 1, 0),
        "assignments": task.assignments.count(),
        "comments": task.comments.count(),
        "history": task.history_entries.count(),
    }


@transaction.atomic
def delete_task(task, scope="task_only"):
    impact = task_delete_impact(task)

    if task.recurring_series and scope == "future":
        tasks = task.recurring_series.tasks.filter(scheduled_start_at__gte=task.scheduled_start_at)
        impact["tasks"] = tasks.count()
        tasks.delete()
        return impact

    if task.recurring_series and scope == "full_setup":
        series = task.recurring_series
        impact["tasks"] = series.tasks.count()
        impact["series"] = 1
        series.delete()
        return impact

    task.delete()
    return impact


@transaction.atomic
def start_task(task, actor_id=None, note=""):
    task.status = "in_progress"
    task.actual_start_at = timezone.now()
    task.worker_note = note or task.worker_note
    task.save(update_fields=["status", "actual_start_at", "worker_note", "updated_at"])
    _history(task, "start", actor_id=actor_id, action_note=note)
    return task


@transaction.atomic
def complete_task(task, actor_id=None, note=""):
    task.status = "completed_pending_confirmation"
    task.worker_completed_at = timezone.now()
    task.worker_note = note or task.worker_note
    task.save(update_fields=["status", "worker_completed_at", "worker_note", "updated_at"])
    _history(task, "complete", actor_id=actor_id, action_note=note)
    if note:
        TaskCommentRecord.objects.create(task=task, author_id=actor_id, comment_type="completion", message=note)
    return task


@transaction.atomic
def confirm_completion(task, actor_id=None, note=""):
    task.status = "completed"
    task.manager_confirmed_at = timezone.now()
    task.completion_confirmation_note = note
    task.save(update_fields=["status", "manager_confirmed_at", "completion_confirmation_note", "updated_at"])
    _history(task, "confirm_completion", actor_id=actor_id, action_note=note)
    return task


@transaction.atomic
def postpone_task(task, actor_id=None, reason="", new_start_at=None, new_end_at=None):
    task.status = "postponed"
    task.postponement_reason = reason
    if new_start_at:
        task.scheduled_start_at = new_start_at
    if new_end_at:
        task.scheduled_end_at = new_end_at
    task.save(
        update_fields=[
            "status",
            "postponement_reason",
            "scheduled_start_at",
            "scheduled_end_at",
            "updated_at",
        ]
    )
    _history(task, "postpone", actor_id=actor_id, action_note=reason)
    return task


@transaction.atomic
def cancel_task(task, actor_id=None, reason=""):
    task.status = "cancelled"
    task.cancellation_reason = reason
    task.save(update_fields=["status", "cancellation_reason", "updated_at"])
    _history(task, "cancel", actor_id=actor_id, action_note=reason)
    return task


@transaction.atomic
def add_comment(task, comment_type, message, author_id=None):
    comment = TaskCommentRecord.objects.create(
        task=task,
        author_id=author_id,
        comment_type=comment_type,
        message=message,
    )
    _history(task, "comment", actor_id=author_id, action_note=message)
    return comment


def tasks_dashboard(queryset):
    now = timezone.now()
    today = timezone.localdate()
    start_of_week = today - timedelta(days=today.weekday())
    issue_delay_task_ids = TaskCommentRecord.objects.filter(comment_type__in=["issue", "delay"]).values_list(
        "task_id",
        flat=True,
    )
    worker_counts = (
        queryset.filter(scheduled_start_at__date=today)
        .values("assignments__worker__full_name")
        .annotate(count=Count("id", distinct=True))
        .order_by("-count")
    )

    return {
        "summary": {
            "tasks_today": queryset.filter(scheduled_start_at__date=today).count(),
            "overdue_tasks": queryset.filter(scheduled_end_at__lt=now).exclude(status__in=["completed", "cancelled"]).count(),
            "in_progress": queryset.filter(status="in_progress").count(),
            "waiting_confirmation": queryset.filter(status="completed_pending_confirmation").count(),
            "completed_this_week": queryset.filter(status="completed", manager_confirmed_at__date__gte=start_of_week).count(),
            "postponed": queryset.filter(status="postponed").count(),
            "cancelled": queryset.filter(status="cancelled").count(),
        },
        "needs_attention": [
            {"id": task.id, "title": task.title, "status": task.status}
            for task in queryset.filter(
                Q(status="completed_pending_confirmation")
                | Q(scheduled_end_at__lt=now, status__in=["scheduled", "in_progress", "postponed"])
            )[:8]
        ],
        "overdue": [
            {"id": task.id, "title": task.title, "scheduled_end_at": task.scheduled_end_at}
            for task in queryset.filter(scheduled_end_at__lt=now).exclude(status__in=["completed", "cancelled"])[:8]
        ],
        "unassigned": [
            {"id": task.id, "title": task.title, "scheduled_start_at": task.scheduled_start_at}
            for task in queryset.annotate(assignee_count=Count("assignments")).filter(assignee_count=0)[:8]
        ],
        "completed_pending_confirmation": [
            {"id": task.id, "title": task.title, "worker_completed_at": task.worker_completed_at}
            for task in queryset.filter(status="completed_pending_confirmation")[:8]
        ],
        "tasks_with_issue_or_delay_comments": [
            {"id": task.id, "title": task.title}
            for task in queryset.filter(id__in=issue_delay_task_ids).distinct()[:8]
        ],
        "today_by_worker": [
            {
                "assignments__worker__username": row["assignments__worker__full_name"] or "Unassigned",
                "count": row["count"],
            }
            for row in worker_counts
        ],
        "today_by_plant": list(
            queryset.filter(scheduled_start_at__date=today)
            .values("plant__name")
            .annotate(count=Count("id"))
            .order_by("-count")
        ),
        "upcoming_tasks": [
            {"id": task.id, "title": task.title, "scheduled_start_at": task.scheduled_start_at}
            for task in queryset.filter(scheduled_start_at__gte=now).order_by("scheduled_start_at")[:8]
        ],
        "recently_updated_tasks": [
            {"id": task.id, "title": task.title, "updated_at": task.updated_at}
            for task in queryset.order_by("-updated_at")[:8]
        ],
    }


def task_activity(queryset, params):
    task_ids = list(queryset.values_list("id", flat=True))
    comments = TaskCommentRecord.objects.filter(task_id__in=task_ids).select_related("task", "author")
    history = TaskHistoryEntry.objects.filter(task_id__in=task_ids).select_related("task", "actor")

    if task_id := params.get("task"):
        comments = comments.filter(task_id=task_id)
        history = history.filter(task_id=task_id)
    if actor_id := params.get("actor"):
        comments = comments.filter(author_id=actor_id)
        history = history.filter(actor_id=actor_id)
    if comment_type := params.get("comment_type"):
        comments = comments.filter(comment_type=comment_type)
    if date_from := params.get("date_from"):
        comments = comments.filter(created_at__date__gte=date_from)
        history = history.filter(created_at__date__gte=date_from)
    if date_to := params.get("date_to"):
        comments = comments.filter(created_at__date__lte=date_to)
        history = history.filter(created_at__date__lte=date_to)

    items = [
        {
            "id": f"comment-{comment.id}",
            "type": "comment",
            "task_id": comment.task_id,
            "task_title": comment.task.title,
            "actor": comment.author.full_name if comment.author else "",
            "comment_type": comment.comment_type,
            "message": comment.message,
            "created_at": comment.created_at,
        }
        for comment in comments
    ]
    items.extend(
        {
            "id": f"history-{entry.id}",
            "type": "history",
            "task_id": entry.task_id,
            "task_title": entry.task.title,
            "actor": entry.actor.full_name if entry.actor else "",
            "action_type": entry.action_type,
            "message": entry.action_note,
            "created_at": entry.created_at,
        }
        for entry in history
    )
    return sorted(items, key=lambda item: aware_datetime(item["created_at"]), reverse=True)
