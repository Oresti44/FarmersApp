from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    RecurringTaskSeriesViewSet,
    TaskAssignmentViewSet,
    TaskCommentViewSet,
    TaskTemplateViewSet,
    WorkerGroupViewSet,
    WorkTaskViewSet,
    api_root,
    health_check,
    task_conflicts,
    task_dashboard,
)


router = DefaultRouter()
router.register("tasks", WorkTaskViewSet, basename="tasks")
router.register("recurring-series", RecurringTaskSeriesViewSet, basename="recurring-series")
router.register("task-templates", TaskTemplateViewSet, basename="task-templates")
router.register("worker-groups", WorkerGroupViewSet, basename="worker-groups")
router.register("assignments", TaskAssignmentViewSet, basename="assignments")
router.register("comments", TaskCommentViewSet, basename="comments")


urlpatterns = [
    path("", api_root, name="api-root"),
    path("health/", health_check, name="health-check"),
    path("tasks/dashboard/", task_dashboard, name="task-dashboard"),
    path("tasks/conflicts/", task_conflicts, name="task-conflicts"),
    path("", include(router.urls)),
]
