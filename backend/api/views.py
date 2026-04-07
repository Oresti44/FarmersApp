from django.contrib.auth import get_user_model
from django.db.models import Count, Q, Sum
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import (
    RecurringTaskSeries,
    TaskAssignment,
    TaskComment,
    TaskTemplate,
    WorkTask,
    WorkerGroup,
)
from .serializers import (
    RecurringTaskSeriesSerializer,
    TaskAssignmentSerializer,
    TaskCommentSerializer,
    TaskTemplateSerializer,
    WorkTaskSerializer,
    WorkerGroupSerializer,
)


User = get_user_model()


def apply_role_scope(request, queryset):
    role = request.query_params.get("acting_as", "manager").lower()
    username = request.query_params.get("username", "").strip()

    if role != "worker" or not username:
        return queryset

    return queryset.filter(
        Q(assigned_workers__username=username)
        | Q(assignments__worker__username=username)
    ).distinct()


@api_view(["GET"])
def api_root(request):
    return Response(
        {
            "name": "FarmersApp API",
            "status": "ok",
            "endpoints": {
                "health": request.build_absolute_uri("health/"),
            },
        }
    )


@api_view(["GET"])
def health_check(request):
    return Response({"status": "healthy"})


class RoleScopedQuerysetMixin:
    def apply_role_scope(self, queryset):
        return apply_role_scope(self.request, queryset)


class WorkTaskViewSet(RoleScopedQuerysetMixin, viewsets.ModelViewSet):
    serializer_class = WorkTaskSerializer
    queryset = (
        WorkTask.objects.all()
        .select_related(
            "created_by",
            "assigned_group",
            "recurring_series",
            "last_status_changed_by",
            "parent_task",
        )
        .prefetch_related(
            "assigned_workers",
            "assignments__worker",
            "checklist_items",
            "comments__author",
            "history_entries__actor",
            "can_start_after",
        )
    )

    def get_queryset(self):
        queryset = self.apply_role_scope(super().get_queryset())
        params = self.request.query_params
        today = timezone.localdate()

        if status_value := params.get("status"):
            queryset = queryset.filter(status=status_value)
        if priority := params.get("priority"):
            queryset = queryset.filter(priority=priority)
        if category := params.get("category"):
            queryset = queryset.filter(category=category)
        if location := params.get("location"):
            queryset = queryset.filter(location__icontains=location)
        if created_by := params.get("created_by"):
            queryset = queryset.filter(created_by__username=created_by)
        if assignee := params.get("assignee"):
            queryset = queryset.filter(assigned_workers__username=assignee)
        if related_entity := params.get("related_entity"):
            queryset = queryset.filter(related_entity_name__icontains=related_entity)
        if resource := params.get("resource"):
            queryset = queryset.filter(required_items__icontains=resource)
        if query := params.get("search"):
            queryset = queryset.filter(Q(title__icontains=query) | Q(description__icontains=query))
        if params.get("recurring") == "true":
            queryset = queryset.filter(is_recurring=True)
        if params.get("recurring") == "false":
            queryset = queryset.filter(is_recurring=False)
        if params.get("completed") == "true":
            queryset = queryset.filter(status="completed")
        if params.get("completed") == "false":
            queryset = queryset.exclude(status="completed")
        if params.get("overdue") == "true":
            queryset = queryset.filter(end_at__lt=timezone.now()).exclude(status="completed")
        if date_from := params.get("date_from"):
            queryset = queryset.filter(start_at__date__gte=date_from)
        if date_to := params.get("date_to"):
            queryset = queryset.filter(end_at__date__lte=date_to)
        if day := params.get("day"):
            queryset = queryset.filter(start_at__date=day)
        if week_start := params.get("week_start"):
            queryset = queryset.filter(start_at__date__gte=week_start)
        if today_only := params.get("today"):
            if today_only == "true":
                queryset = queryset.filter(start_at__date=today)

        return queryset.distinct()


class RecurringTaskSeriesViewSet(viewsets.ModelViewSet):
    serializer_class = RecurringTaskSeriesSerializer
    queryset = RecurringTaskSeries.objects.all().select_related("created_by")


class TaskTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = TaskTemplateSerializer
    queryset = TaskTemplate.objects.all().select_related("created_by")


class WorkerGroupViewSet(viewsets.ModelViewSet):
    serializer_class = WorkerGroupSerializer
    queryset = WorkerGroup.objects.all().prefetch_related("members")


class TaskAssignmentViewSet(RoleScopedQuerysetMixin, viewsets.ModelViewSet):
    serializer_class = TaskAssignmentSerializer
    queryset = TaskAssignment.objects.all().select_related("task", "worker", "assigned_by")

    def get_queryset(self):
        queryset = super().get_queryset()
        task_queryset = self.apply_role_scope(WorkTask.objects.all())
        return queryset.filter(task__in=task_queryset)


class TaskCommentViewSet(RoleScopedQuerysetMixin, viewsets.ModelViewSet):
    serializer_class = TaskCommentSerializer
    queryset = TaskComment.objects.all().select_related("task", "author")

    def get_queryset(self):
        queryset = super().get_queryset()
        task_queryset = self.apply_role_scope(WorkTask.objects.all())
        return queryset.filter(task__in=task_queryset)


@api_view(["GET"])
def task_dashboard(request):
    queryset = apply_role_scope(request, WorkTask.objects.all())
    queryset = queryset.select_related("assigned_group").prefetch_related("assigned_workers")
    now = timezone.now()
    today = timezone.localdate()

    overview = queryset.aggregate(
        total_tasks=Count("id"),
        scheduled_tasks=Count("id", filter=Q(status="scheduled")),
        in_progress_tasks=Count("id", filter=Q(status="in_progress")),
        completed_tasks=Count("id", filter=Q(status="completed")),
        cancelled_tasks=Count("id", filter=Q(status="cancelled")),
        overdue_tasks=Count("id", filter=Q(end_at__lt=now) & ~Q(status="completed")),
    )
    by_priority = list(queryset.values("priority").annotate(total=Count("id")).order_by("priority"))
    by_category = list(queryset.values("category").annotate(total=Count("id")).order_by("category"))
    by_status = list(queryset.values("status").annotate(total=Count("id")).order_by("status"))
    daily_distribution = list(
        queryset.values("start_at__date").annotate(total=Count("id")).order_by("start_at__date")[:14]
    )
    worker_distribution = list(
        queryset.values("assigned_workers__username")
        .annotate(
            total=Count("id", distinct=True),
            estimated_minutes=Sum("estimated_duration_minutes"),
        )
        .order_by("-total")
    )
    today_tasks = queryset.filter(start_at__date=today).order_by("start_at")[:8]

    return Response(
        {
            "overview": overview,
            "by_priority": by_priority,
            "by_category": by_category,
            "by_status": by_status,
            "daily_distribution": daily_distribution,
            "worker_distribution": worker_distribution,
            "today_tasks": WorkTaskSerializer(today_tasks, many=True).data,
        }
    )


@api_view(["GET"])
def task_conflicts(request):
    assignee = request.query_params.get("assignee", "").strip()
    queryset = WorkTask.objects.exclude(status__in=["cancelled", "completed"])
    if assignee:
        queryset = queryset.filter(assigned_workers__username=assignee)

    tasks = list(
        queryset.order_by("start_at").values(
            "id",
            "title",
            "start_at",
            "end_at",
            "assigned_workers__username",
        )
    )

    conflicts = []
    for index, current in enumerate(tasks):
        for other in tasks[index + 1 :]:
            same_worker = (
                current["assigned_workers__username"]
                and current["assigned_workers__username"] == other["assigned_workers__username"]
            )
            overlap = current["start_at"] < other["end_at"] and other["start_at"] < current["end_at"]
            if same_worker and overlap:
                conflicts.append(
                    {
                        "worker": current["assigned_workers__username"],
                        "task_a": {"id": current["id"], "title": current["title"]},
                        "task_b": {"id": other["id"], "title": other["title"]},
                        "start_at": max(current["start_at"], other["start_at"]),
                        "end_at": min(current["end_at"], other["end_at"]),
                    }
                )

    return Response({"count": len(conflicts), "results": conflicts})
