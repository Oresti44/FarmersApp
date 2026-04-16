from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from api.modules.plants.models import Greenhouse, HarvestHistoryEntry, Plant, Plot
from api.modules.tasks.models import ResourceUsageEntry


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
