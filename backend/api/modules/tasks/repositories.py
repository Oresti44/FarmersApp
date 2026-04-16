from django.db.models import Count, Prefetch, Q

from api.modules.tasks.models import Task, TaskAssignmentRecord, TaskCommentRecord, TaskHistoryEntry


class TasksRepository:
    @staticmethod
    def queryset():
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

    @staticmethod
    def apply_filters(queryset, params):
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
