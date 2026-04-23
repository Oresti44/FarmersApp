from django.urls import include, path
from rest_framework.routers import DefaultRouter

from api.modules.inventory.controllers import (
    InventoryCategoriesViewSet,
    InventoryItemsViewSet,
    InventoryMovementsViewSet,
)
from api.modules.plants.controllers import (
    GreenhousesViewSet,
    HarvestHistoryViewSet,
    PlantsViewSet,
    PlotsViewSet,
    ResourceUsageViewSet,
)
from api.modules.shared.controllers import api_root, health_check, ui_meta
from api.modules.tasks.controllers import TaskSeriesViewSet, TasksViewSet


router = DefaultRouter()
router.register("tasks", TasksViewSet, basename="tasks")
router.register("task-series", TaskSeriesViewSet, basename="task-series")
router.register("plants", PlantsViewSet, basename="plants")
router.register("plots", PlotsViewSet, basename="plots")
router.register("greenhouses", GreenhousesViewSet, basename="greenhouses")
router.register("harvest-history", HarvestHistoryViewSet, basename="harvest-history")
router.register("resource-usage", ResourceUsageViewSet, basename="resource-usage")
router.register("inventory-categories", InventoryCategoriesViewSet, basename="inventory-categories")
router.register("inventory-items", InventoryItemsViewSet, basename="inventory-items")
router.register("inventory-movements", InventoryMovementsViewSet, basename="inventory-movements")


urlpatterns = [
    path("", api_root, name="api-root"),
    path("health/", health_check, name="health-check"),
    path("ui-meta/", ui_meta, name="ui-meta"),
    path("", include(router.urls)),
]
