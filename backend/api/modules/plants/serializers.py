from django.utils import timezone
from rest_framework import serializers

from api import database
from api.modules.plants.models import Farm, Greenhouse, HarvestHistoryEntry, Plant, PlantStage, Plot
from api.modules.plants.validators import validate_expected_range, validate_plant_payload
from api.modules.shared.serializers import UserSlimSerializer
from api.modules.tasks.models import ResourceUsageEntry, Task


class FarmSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Farm
        fields = ["id", "name", "location_text"]


class PlantStageSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = PlantStage
        fields = ["id", "name", "sort_order", "description"]


class PlotSummarySerializer(serializers.ModelSerializer):
    farm = FarmSummarySerializer(read_only=True)
    current_plant = serializers.SerializerMethodField()

    class Meta:
        model = Plot
        fields = [
            "id",
            "name",
            "code",
            "farm",
            "size_value",
            "size_unit",
            "soil_type",
            "irrigation_type",
            "status",
            "notes",
            "current_plant",
        ]

    def get_current_plant(self, obj):
        plant = next(iter(obj.plants.all()), None)
        if not plant:
            return None
        return {"id": plant.id, "name": plant.name, "variety": plant.variety, "status": plant.status}


class GreenhouseSummarySerializer(serializers.ModelSerializer):
    farm = FarmSummarySerializer(read_only=True)
    plant_count = serializers.SerializerMethodField()
    related_plants = serializers.SerializerMethodField()

    class Meta:
        model = Greenhouse
        fields = [
            "id",
            "name",
            "code",
            "farm",
            "size_value",
            "size_unit",
            "greenhouse_type",
            "temperature_min_c",
            "temperature_max_c",
            "humidity_target_percent",
            "status",
            "notes",
            "plant_count",
            "related_plants",
        ]

    def get_plant_count(self, obj):
        return len(obj.plants.all())

    def get_related_plants(self, obj):
        return [
            {
                "id": plant.id,
                "name": plant.name,
                "variety": plant.variety,
                "stage": plant.stage.name,
                "status": plant.status,
            }
            for plant in obj.plants.all()
        ]


class HarvestHistorySerializer(serializers.ModelSerializer):
    recorded_by = UserSlimSerializer(read_only=True)
    plant_name = serializers.CharField(source="plant.name", read_only=True)
    plant_summary = serializers.SerializerMethodField()

    class Meta:
        model = HarvestHistoryEntry
        fields = [
            "id",
            "plant",
            "plant_name",
            "plant_summary",
            "harvested_at",
            "quantity",
            "quantity_unit",
            "quality_grade",
            "notes",
            "recorded_by",
            "created_at",
        ]

    def get_plant_summary(self, obj):
        return {
            "id": obj.plant.id,
            "name": obj.plant.name,
            "variety": obj.plant.variety,
            "status": obj.plant.status,
        }


class ResourceUsageSerializer(serializers.ModelSerializer):
    recorded_by = UserSlimSerializer(read_only=True)
    linked_task = serializers.SerializerMethodField()
    plant_name = serializers.CharField(source="plant.name", read_only=True)
    plant_summary = serializers.SerializerMethodField()

    class Meta:
        model = ResourceUsageEntry
        fields = [
            "id",
            "plant",
            "plant_name",
            "plant_summary",
            "task",
            "linked_task",
            "resource_name",
            "resource_type",
            "quantity",
            "quantity_unit",
            "used_at",
            "notes",
            "recorded_by",
            "created_at",
        ]

    def get_linked_task(self, obj):
        if not obj.task:
            return None
        return {"id": obj.task.id, "title": obj.task.title, "status": obj.task.status}

    def get_plant_summary(self, obj):
        return {
            "id": obj.plant.id,
            "name": obj.plant.name,
            "variety": obj.plant.variety,
            "status": obj.plant.status,
        }


class PlantTaskSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ["id", "title", "status", "priority", "scheduled_start_at", "scheduled_end_at"]


class PlantSummarySerializer(serializers.ModelSerializer):
    stage = PlantStageSummarySerializer(read_only=True)
    farm = serializers.SerializerMethodField()
    area_summary = serializers.SerializerMethodField()
    latest_harvest_summary = serializers.SerializerMethodField()
    latest_resource_usage_summary = serializers.SerializerMethodField()
    active_tasks_count = serializers.IntegerField(read_only=True)
    recurring_series_count = serializers.IntegerField(read_only=True)
    area_type = serializers.SerializerMethodField()

    class Meta:
        model = Plant
        fields = [
            "id",
            "name",
            "variety",
            "stage",
            "quantity",
            "quantity_unit",
            "planted_date",
            "expected_harvest_date",
            "status",
            "notes",
            "area_type",
            "farm",
            "area_summary",
            "active_tasks_count",
            "recurring_series_count",
            "latest_harvest_summary",
            "latest_resource_usage_summary",
            "created_at",
            "updated_at",
        ]

    def get_area_type(self, obj):
        return obj.area_type

    def get_farm(self, obj):
        farm = obj.farm
        return FarmSummarySerializer(farm).data if farm else None

    def get_area_summary(self, obj):
        area = obj.area
        if not area:
            return None
        base = {
            "id": area.id,
            "type": obj.area_type,
            "name": area.name,
            "code": area.code,
            "status": area.status,
        }
        if obj.area_type == "plot":
            base["soil_type"] = area.soil_type
            base["irrigation_type"] = area.irrigation_type
        else:
            base["greenhouse_type"] = area.greenhouse_type
        return base

    def get_latest_harvest_summary(self, obj):
        latest = next(iter(obj.harvest_history.all()), None)
        if not latest:
            return None
        return {
            "id": latest.id,
            "harvested_at": latest.harvested_at,
            "quantity": latest.quantity,
            "quantity_unit": latest.quantity_unit,
            "quality_grade": latest.quality_grade,
        }

    def get_latest_resource_usage_summary(self, obj):
        latest = next(iter(obj.resource_usage.all()), None)
        if not latest:
            return None
        return {
            "id": latest.id,
            "used_at": latest.used_at,
            "resource_name": latest.resource_name,
            "resource_type": latest.resource_type,
            "quantity": latest.quantity,
            "quantity_unit": latest.quantity_unit,
        }


class PlantDetailSerializer(PlantSummarySerializer):
    tasks = PlantTaskSummarySerializer(many=True, read_only=True)
    recurring_task_series = serializers.SerializerMethodField()
    harvest_history = HarvestHistorySerializer(many=True, read_only=True)
    resource_usage = ResourceUsageSerializer(many=True, read_only=True)
    activity_timeline = serializers.SerializerMethodField()

    class Meta(PlantSummarySerializer.Meta):
        fields = PlantSummarySerializer.Meta.fields + [
            "tasks",
            "recurring_task_series",
            "harvest_history",
            "resource_usage",
            "activity_timeline",
        ]

    def get_recurring_task_series(self, obj):
        return [
            {
                "id": series.id,
                "title": series.title,
                "frequency": series.frequency,
                "interval_value": series.interval_value,
                "time_of_day": series.time_of_day,
                "is_active": series.is_active,
            }
            for series in obj.recurring_series.all()
        ]

    def get_activity_timeline(self, obj):
        items = [
            {
                "type": "plant",
                "title": "Plant created",
                "at": obj.created_at,
                "note": obj.notes,
            }
        ]
        items.extend(
            {
                "type": "harvest",
                "title": f"Harvest recorded: {entry.quantity} {entry.quantity_unit}",
                "at": entry.harvested_at,
                "note": entry.notes,
            }
            for entry in obj.harvest_history.all()
        )
        items.extend(
            {
                "type": "resource",
                "title": f"Resource used: {entry.resource_name}",
                "at": entry.used_at,
                "note": entry.notes,
            }
            for entry in obj.resource_usage.all()
        )
        items.extend(
            {
                "type": "task",
                "title": f"Task linked: {task.title}",
                "at": task.scheduled_start_at,
                "note": task.status,
            }
            for task in obj.tasks.all()
        )
        return sorted(items, key=lambda item: database.aware_datetime(item["at"]), reverse=True)


class PlantWriteSerializer(serializers.ModelSerializer):
    plot_id = serializers.PrimaryKeyRelatedField(
        source="plot",
        queryset=database.all_plots_queryset(),
        required=False,
        allow_null=True,
    )
    greenhouse_id = serializers.PrimaryKeyRelatedField(
        source="greenhouse",
        queryset=database.all_greenhouses_queryset(),
        required=False,
        allow_null=True,
    )
    stage_id = serializers.PrimaryKeyRelatedField(source="stage", queryset=database.all_plant_stages_queryset())

    class Meta:
        model = Plant
        fields = [
            "id",
            "name",
            "variety",
            "stage_id",
            "quantity",
            "quantity_unit",
            "planted_date",
            "expected_harvest_date",
            "status",
            "notes",
            "plot_id",
            "greenhouse_id",
        ]

    def validate(self, attrs):
        instance = getattr(self, "instance", None)
        validate_plant_payload(attrs, instance=instance)
        planted = attrs.get("planted_date", getattr(instance, "planted_date", None))
        harvest = attrs.get("expected_harvest_date", getattr(instance, "expected_harvest_date", None))
        validate_expected_range(planted, harvest)
        return attrs


class PlotWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plot
        fields = "__all__"


class GreenhouseWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Greenhouse
        fields = "__all__"


class HarvestHistoryWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = HarvestHistoryEntry
        fields = "__all__"


class ResourceUsageWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceUsageEntry
        fields = "__all__"
