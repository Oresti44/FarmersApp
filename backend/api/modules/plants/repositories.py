from django.db.models import Count, Prefetch, Q

from api.modules.plants.models import Greenhouse, HarvestHistoryEntry, Plant, Plot
from api.modules.tasks.models import ResourceUsageEntry, Task


class PlantsRepository:
    @staticmethod
    def queryset():
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


class PlotsRepository:
    @staticmethod
    def queryset():
        return Plot.objects.select_related("farm").prefetch_related("plants__stage").order_by("farm__name", "name")


class GreenhousesRepository:
    @staticmethod
    def queryset():
        return (
            Greenhouse.objects.select_related("farm")
            .prefetch_related("plants__stage")
            .order_by("farm__name", "name")
        )
