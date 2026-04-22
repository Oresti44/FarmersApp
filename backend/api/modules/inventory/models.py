from django.db import models
from django.utils import timezone

from api.modules.plants.models import Farm, Plant
from api.modules.tasks.models import Task


class InventoryCategory(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        db_table = "inventory_categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class InventoryItem(models.Model):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("inactive", "Inactive"),
        ("archived", "Archived"),
    ]

    farm = models.ForeignKey(Farm, related_name="inventory_items", on_delete=models.CASCADE)
    category = models.ForeignKey(InventoryCategory, related_name="items", on_delete=models.PROTECT)
    name = models.CharField(max_length=120)
    unit = models.CharField(max_length=30)
    current_quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    low_stock_threshold = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    storage_location = models.CharField(max_length=120, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "inventory_items"
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(fields=["farm", "name"], name="uq_inventory_item_name_per_farm"),
            models.CheckConstraint(check=models.Q(current_quantity__gte=0), name="chk_inventory_items_quantity"),
            models.CheckConstraint(check=models.Q(low_stock_threshold__gte=0), name="chk_inventory_items_threshold"),
        ]

    def __str__(self):
        return self.name


class InventoryMovement(models.Model):
    MOVEMENT_TYPE_CHOICES = [
        ("stock_in", "Stock In"),
        ("stock_out", "Stock Out"),
        ("adjustment", "Adjustment"),
        ("waste", "Waste"),
    ]

    inventory_item = models.ForeignKey(InventoryItem, related_name="movements", on_delete=models.CASCADE)
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPE_CHOICES)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    movement_date = models.DateTimeField(default=timezone.now)
    task = models.ForeignKey(Task, related_name="inventory_movements", on_delete=models.SET_NULL, null=True, blank=True)
    plant = models.ForeignKey(Plant, related_name="inventory_movements", on_delete=models.SET_NULL, null=True, blank=True)
    note = models.TextField(blank=True)
    created_by = models.ForeignKey(
        "api.User",
        db_column="created_by",
        related_name="created_inventory_movements",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "inventory_movements"
        ordering = ["-movement_date", "-id"]
        constraints = [
            models.CheckConstraint(check=models.Q(quantity__gt=0), name="chk_inventory_movements_quantity"),
        ]

    def __str__(self):
        return f"{self.inventory_item}: {self.movement_type}"
