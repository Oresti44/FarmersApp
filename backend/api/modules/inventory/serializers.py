from decimal import Decimal

from rest_framework import serializers

from api import database
from api.modules.inventory.models import InventoryCategory, InventoryItem, InventoryMovement
from api.modules.plants.serializers import FarmSummarySerializer
from api.modules.shared.serializers import UserSlimSerializer


class InventoryCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryCategory
        fields = ["id", "name", "description"]


class InventoryItemListSerializer(serializers.ModelSerializer):
    farm = FarmSummarySerializer(read_only=True)
    category = InventoryCategorySerializer(read_only=True)
    quantity_state = serializers.SerializerMethodField()
    latest_movement = serializers.SerializerMethodField()
    movement_totals = serializers.SerializerMethodField()

    class Meta:
        model = InventoryItem
        fields = [
            "id",
            "farm",
            "category",
            "name",
            "unit",
            "current_quantity",
            "low_stock_threshold",
            "storage_location",
            "status",
            "notes",
            "quantity_state",
            "latest_movement",
            "movement_totals",
            "created_at",
            "updated_at",
        ]

    def get_quantity_state(self, obj):
        current = Decimal(obj.current_quantity or 0)
        threshold = Decimal(obj.low_stock_threshold or 0)
        if current <= 0:
            tone = "empty"
        elif current <= threshold:
            tone = "low"
        else:
            tone = "healthy"
        return {
            "is_low_stock": current <= threshold,
            "tone": tone,
        }

    def get_latest_movement(self, obj):
        movement = next(iter(obj.movements.all()), None)
        if not movement:
            return None
        return {
            "id": movement.id,
            "movement_type": movement.movement_type,
            "quantity": movement.quantity,
            "movement_date": movement.movement_date,
        }

    def get_movement_totals(self, obj):
        return {
            "total_movements": len(obj.movements.all()),
            "stock_out_movements": len(
                [movement for movement in obj.movements.all() if movement.movement_type in ["stock_out", "waste"]]
            ),
        }


class InventoryMovementSerializer(serializers.ModelSerializer):
    inventory_item_summary = serializers.SerializerMethodField()
    plant_summary = serializers.SerializerMethodField()
    task_summary = serializers.SerializerMethodField()
    created_by = UserSlimSerializer(read_only=True)

    class Meta:
        model = InventoryMovement
        fields = [
            "id",
            "inventory_item",
            "inventory_item_summary",
            "movement_type",
            "quantity",
            "movement_date",
            "task",
            "task_summary",
            "plant",
            "plant_summary",
            "note",
            "created_by",
            "created_at",
        ]

    def get_inventory_item_summary(self, obj):
        item = obj.inventory_item
        return {
            "id": item.id,
            "name": item.name,
            "unit": item.unit,
            "farm_name": item.farm.name,
            "category_name": item.category.name,
        }

    def get_plant_summary(self, obj):
        if not obj.plant:
            return None
        return {
            "id": obj.plant.id,
            "name": obj.plant.name,
            "variety": obj.plant.variety,
        }

    def get_task_summary(self, obj):
        if not obj.task:
            return None
        return {
            "id": obj.task.id,
            "title": obj.task.title,
            "status": obj.task.status,
        }


class InventoryItemDetailSerializer(InventoryItemListSerializer):
    recent_movements = InventoryMovementSerializer(source="movements", many=True, read_only=True)

    class Meta(InventoryItemListSerializer.Meta):
        fields = InventoryItemListSerializer.Meta.fields + ["recent_movements"]


class InventoryCategoryWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryCategory
        fields = ["id", "name", "description"]


class InventoryItemWriteSerializer(serializers.ModelSerializer):
    farm_id = serializers.PrimaryKeyRelatedField(source="farm", queryset=database.farms_queryset())
    category_id = serializers.PrimaryKeyRelatedField(
        source="category",
        queryset=database.inventory_categories_queryset(),
    )

    class Meta:
        model = InventoryItem
        fields = [
            "id",
            "farm_id",
            "category_id",
            "name",
            "unit",
            "current_quantity",
            "low_stock_threshold",
            "storage_location",
            "status",
            "notes",
        ]


class InventoryMovementWriteSerializer(serializers.ModelSerializer):
    inventory_item_id = serializers.PrimaryKeyRelatedField(
        source="inventory_item",
        queryset=database.inventory_items_queryset(),
    )
    created_by_id = serializers.IntegerField(required=False, allow_null=True, write_only=True)

    class Meta:
        model = InventoryMovement
        fields = [
            "id",
            "inventory_item_id",
            "movement_type",
            "quantity",
            "movement_date",
            "task",
            "plant",
            "note",
            "created_by_id",
        ]
