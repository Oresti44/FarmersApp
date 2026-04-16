from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Count, Q
from django.utils import timezone

from api.modules.tasks.models import (
    RecurringTaskPlan,
    Task,
    TaskAssignmentRecord,
    TaskCommentRecord,
    TaskHistoryEntry,
)


User = get_user_model()


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


def _assigned_workers(task, worker_ids, assigned_by_id=None, note=""):
    TaskAssignmentRecord.objects.filter(task=task).exclude(worker_id__in=worker_ids).delete()
    existing = set(TaskAssignmentRecord.objects.filter(task=task).values_list("worker_id", flat=True))
    missing = [worker_id for worker_id in worker_ids if worker_id not in existing]
    TaskAssignmentRecord.objects.bulk_create(
        [
            TaskAssignmentRecord(task=task, worker_id=worker_id, assigned_by_id=assigned_by_id)
            for worker_id in missing
        ]
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
        _assigned_workers(task, worker_ids, actor_id)
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
        _assigned_workers(task, worker_ids, actor_id)

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


def _task_delete_impact(task):
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
    impact = _task_delete_impact(task)

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
    task.save(
        update_fields=["status", "manager_confirmed_at", "completion_confirmation_note", "updated_at"]
    )
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
        "today_by_worker": list(
            queryset.filter(scheduled_start_at__date=today)
            .values("assignments__worker__username")
            .annotate(count=Count("id", distinct=True))
            .order_by("-count")
        ),
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
            "actor": comment.author.get_full_name().strip() if comment.author else "",
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
            "actor": entry.actor.get_full_name().strip() if entry.actor else "",
            "action_type": entry.action_type,
            "message": entry.action_note,
            "created_at": entry.created_at,
        }
        for entry in history
    )
    return sorted(items, key=lambda item: item["created_at"], reverse=True)
