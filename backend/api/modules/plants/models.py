from django.contrib.auth import get_user_model
from django.db import models


User = get_user_model()


class Farm(models.Model):
    name = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    location_text = models.CharField(max_length=255, blank=True)
    manager = models.ForeignKey(
        User,
        related_name="managed_farms",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "farms"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Plot(models.Model):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("inactive", "Inactive"),
        ("archived", "Archived"),
    ]

    farm = models.ForeignKey(Farm, related_name="plots", on_delete=models.CASCADE)
    name = models.CharField(max_length=120)
    code = models.CharField(max_length=50, blank=True)
    size_value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    size_unit = models.CharField(max_length=20, default="m2")
    soil_type = models.CharField(max_length=100, blank=True)
    irrigation_type = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "plots"
        ordering = ["farm__name", "name"]
        constraints = [
            models.UniqueConstraint(fields=["farm", "name"], name="uq_plot_name_per_farm"),
        ]

    def __str__(self):
        return self.name


class Greenhouse(models.Model):
    STATUS_CHOICES = Plot.STATUS_CHOICES

    farm = models.ForeignKey(Farm, related_name="greenhouses", on_delete=models.CASCADE)
    name = models.CharField(max_length=120)
    code = models.CharField(max_length=50, blank=True)
    size_value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    size_unit = models.CharField(max_length=20, default="m2")
    greenhouse_type = models.CharField(max_length=100, blank=True)
    temperature_min_c = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    temperature_max_c = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    humidity_target_percent = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "greenhouses"
        ordering = ["farm__name", "name"]
        constraints = [
            models.UniqueConstraint(fields=["farm", "name"], name="uq_greenhouse_name_per_farm"),
        ]

    def __str__(self):
        return self.name


class PlantStage(models.Model):
    name = models.CharField(max_length=80, unique=True)
    sort_order = models.IntegerField(default=0)
    description = models.TextField(blank=True)

    class Meta:
        db_table = "plant_stages"
        ordering = ["sort_order", "name"]

    def __str__(self):
        return self.name


class Plant(models.Model):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("harvested", "Harvested"),
        ("failed", "Failed"),
        ("removed", "Removed"),
    ]

    plot = models.ForeignKey(
        Plot,
        related_name="plants",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    greenhouse = models.ForeignKey(
        Greenhouse,
        related_name="plants",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    stage = models.ForeignKey(PlantStage, related_name="plants", on_delete=models.PROTECT)
    name = models.CharField(max_length=120)
    variety = models.CharField(max_length=120, blank=True)
    quantity = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    quantity_unit = models.CharField(max_length=30, default="plants")
    planted_date = models.DateField(null=True, blank=True)
    expected_harvest_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "plants"
        ordering = ["name", "variety", "id"]
        constraints = [
            models.CheckConstraint(
                check=(
                    (models.Q(plot__isnull=False) & models.Q(greenhouse__isnull=True))
                    | (models.Q(plot__isnull=True) & models.Q(greenhouse__isnull=False))
                ),
                name="chk_plant_area_exactly_one",
            ),
            models.UniqueConstraint(fields=["plot"], name="uq_one_plant_per_plot"),
        ]

    @property
    def area_type(self):
        return "plot" if self.plot_id else "greenhouse"

    @property
    def area(self):
        return self.plot or self.greenhouse

    @property
    def farm(self):
        area = self.area
        return getattr(area, "farm", None)

    def __str__(self):
        return self.name


class HarvestHistoryEntry(models.Model):
    plant = models.ForeignKey(Plant, related_name="harvest_history", on_delete=models.CASCADE)
    harvested_at = models.DateTimeField()
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    quantity_unit = models.CharField(max_length=30, default="kg")
    quality_grade = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    recorded_by = models.ForeignKey(
        User,
        db_column="recorded_by",
        related_name="harvest_records",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "harvest_history"
        ordering = ["-harvested_at", "-id"]
        constraints = [
            models.CheckConstraint(check=models.Q(quantity__gte=0), name="chk_harvest_quantity_non_negative"),
        ]

    def __str__(self):
        return f"{self.plant} @ {self.harvested_at}"
