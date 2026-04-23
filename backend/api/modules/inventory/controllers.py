from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from api import database
from api.modules.inventory.models import InventoryCategory, InventoryItem, InventoryMovement
from api.modules.inventory.serializers import (
    InventoryCategorySerializer,
    InventoryCategoryWriteSerializer,
    InventoryItemDetailSerializer,
    InventoryItemListSerializer,
    InventoryItemWriteSerializer,
    InventoryMovementSerializer,
    InventoryMovementWriteSerializer,
)


class InventoryCategoriesViewSet(viewsets.ModelViewSet):
    queryset = InventoryCategory.objects.none()

    def get_queryset(self):
        return database.inventory_categories_queryset()

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return InventoryCategoryWriteSerializer
        return InventoryCategorySerializer


class InventoryItemsViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.none()

    def get_queryset(self):
        return database.filter_inventory_items(database.inventory_items_queryset(), self.request.query_params)

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return InventoryItemWriteSerializer
        if self.action == "retrieve":
            return InventoryItemDetailSerializer
        return InventoryItemListSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = database.save_serializer(serializer)
        return Response(
            InventoryItemDetailSerializer(database.get_inventory_item(item.pk)).data,
            status=status.HTTP_201_CREATED,
        )

    def partial_update(self, request, *args, **kwargs):
        item = self.get_object()
        serializer = self.get_serializer(item, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        database.save_serializer(serializer)
        return Response(InventoryItemDetailSerializer(database.get_inventory_item(item.pk)).data)

    @action(detail=False, methods=["get"], url_path="dashboard")
    def dashboard(self, request):
        return Response(database.inventory_dashboard(self.get_queryset()))

    @action(detail=True, methods=["get"], url_path="delete-impact")
    def delete_impact(self, request, pk=None):
        return Response(database.inventory_item_delete_impact(self.get_object()))

    def destroy(self, request, *args, **kwargs):
        impact = database.delete_inventory_item(self.get_object())
        return Response({"deleted": impact})


class InventoryMovementsViewSet(viewsets.ModelViewSet):
    queryset = InventoryMovement.objects.none()

    def get_queryset(self):
        return database.filter_inventory_movements(database.inventory_movements_queryset(), self.request.query_params)

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return InventoryMovementWriteSerializer
        return InventoryMovementSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        movement = database.create_inventory_movement(serializer.validated_data)
        return Response(
            InventoryMovementSerializer(database.get_inventory_movement(movement.pk)).data,
            status=status.HTTP_201_CREATED,
        )

    def partial_update(self, request, *args, **kwargs):
        movement = self.get_object()
        serializer = self.get_serializer(movement, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        movement = database.update_inventory_movement(movement, serializer.validated_data)
        return Response(InventoryMovementSerializer(database.get_inventory_movement(movement.pk)).data)

    def destroy(self, request, *args, **kwargs):
        impact = database.delete_inventory_movement(self.get_object())
        return Response({"deleted": impact})
