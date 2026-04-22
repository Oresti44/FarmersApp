from django.utils import timezone
from rest_framework import serializers

from api import database
from api.modules.plants.models import Plant
from api.modules.shared.serializers import UserSlimSerializer
from api.modules.tasks.models import (
    RecurringTaskPlan,
    Task,
    TaskAssignmentRecord,
    TaskCommentRecord,
    TaskHistoryEntry,
)
from api.modules.tasks.validators import validate_recurrence_payload, validate_task_payload


class RecurringTaskPlanSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = RecurringTaskPlan
        fields = [
            "id",
            "title",
            "frequency",
            "interval_value",
            "weekdays_text",
            "start_date",
            "end_date",
            "time_of_day",
            "default_duration_minutes",
            "is_active",
        ]


class TaskAssignmentSerializer(serializers.ModelSerializer):
    worker = UserSlimSerializer(read_only=True)
    assigned_by = UserSlimSerializer(read_only=True)

    class Meta:
        model = TaskAssignmentRecord
        fields = "__all__"


class TaskCommentSerializer(serializers.ModelSerializer):
    author = UserSlimSerializer(read_only=True)

    class Meta:
        model = TaskCommentRecord
        fields = "__all__"


class TaskHistorySerializer(serializers.ModelSerializer):
    actor = UserSlimSerializer(read_only=True)

    class Meta:
        model = TaskHistoryEntry
        fields = "__all__"


class TaskPlantSummarySerializer(serializers.ModelSerializer):
    stage = serializers.CharField(source="stage.name", read_only=True)

    class Meta:
        model = Plant
        fields = ["id", "name", "variety", "status", "stage"]


class TaskListSerializer(serializers.ModelSerializer):
    notes = serializers.CharField(source="manager_note", read_only=True)
    plant_summary = TaskPlantSummarySerializer(source="plant", read_only=True)
    area_summary = serializers.SerializerMethodField()
    recurring_series_summary = RecurringTaskPlanSummarySerializer(source="recurring_series", read_only=True)
    assigned_workers_summary = serializers.SerializerMethodField()
    comments_count = serializers.IntegerField(read_only=True)
    latest_history_entry = serializers.SerializerMethodField()
    flags = serializers.SerializerMethodField()
    created_by = UserSlimSerializer(read_only=True)
    last_updated_by = UserSlimSerializer(read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "category",
            "priority",
            "status",
            "scheduled_start_at",
            "scheduled_end_at",
            "actual_start_at",
            "worker_completed_at",
            "manager_confirmed_at",
            "required_items_text",
            "notes",
            "worker_note",
            "manager_note",
            "postponement_reason",
            "cancellation_reason",
            "completion_confirmation_note",
            "created_by",
            "last_updated_by",
            "created_at",
            "updated_at",
            "plant_summary",
            "area_summary",
            "recurring_series_summary",
            "assigned_workers_summary",
            "comments_count",
            "latest_history_entry",
            "flags",
        ]

    def get_area_summary(self, obj):
        area = obj.plant.area
        if not area:
            return None
        return {
            "id": area.id,
            "type": obj.plant.area_type,
            "name": area.name,
            "code": area.code,
            "farm_name": getattr(area.farm, "name", ""),
        }

    def get_assigned_workers_summary(self, obj):
        return [
            {
                "id": assignment.worker_id,
                "username": assignment.worker.email,
                "full_name": assignment.worker.full_name or assignment.worker.email,
            }
            for assignment in obj.assignments.all()
        ]

    def get_latest_history_entry(self, obj):
        entry = next(iter(obj.history_entries.all()), None)
        if not entry:
            return None
        return TaskHistorySerializer(entry).data

    def get_flags(self, obj):
        now = timezone.now()
        return {
            "overdue": obj.scheduled_end_at < now and obj.status not in ["completed", "cancelled"],
            "needs_confirmation": obj.status == "completed_pending_confirmation",
            "is_repeating_instance": bool(obj.recurring_series_id),
        }


class TaskDetailSerializer(TaskListSerializer):
    assignments = TaskAssignmentSerializer(many=True, read_only=True)
    comments = TaskCommentSerializer(many=True, read_only=True)
    history = TaskHistorySerializer(source="history_entries", many=True, read_only=True)
    linked_resource_usage = serializers.SerializerMethodField()

    class Meta(TaskListSerializer.Meta):
        fields = TaskListSerializer.Meta.fields + [
            "assignments",
            "comments",
            "history",
            "linked_resource_usage",
        ]

    def get_linked_resource_usage(self, obj):
        usage = database.task_resource_usage(obj)
        return [
            {
                "id": entry.id,
                "resource_name": entry.resource_name,
                "resource_type": entry.resource_type,
                "quantity": entry.quantity,
                "quantity_unit": entry.quantity_unit,
                "used_at": entry.used_at,
            }
            for entry in usage
        ]


class TaskWriteSerializer(serializers.ModelSerializer):
    notes = serializers.CharField(source="manager_note", required=False, allow_blank=True)
    plant_id = serializers.PrimaryKeyRelatedField(source="plant", queryset=database.all_plants_queryset())
    assigned_worker_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True,
        write_only=True,
    )
    recurrence = serializers.JSONField(required=False, allow_null=True, write_only=True)
    recurring_update_scope = serializers.ChoiceField(
        choices=["task_only", "future", "full_setup"],
        required=False,
        write_only=True,
    )

    class Meta:
        model = Task
        fields = [
            "id",
            "plant_id",
            "title",
            "description",
            "category",
            "priority",
            "status",
            "scheduled_start_at",
            "scheduled_end_at",
            "required_items_text",
            "notes",
            "worker_note",
            "created_by",
            "last_updated_by",
            "assigned_worker_ids",
            "recurrence",
            "recurring_update_scope",
        ]

    def validate(self, attrs):
        instance = getattr(self, "instance", None)
        validate_task_payload(attrs, instance=instance)
        validate_recurrence_payload(attrs.get("recurrence"))
        return attrs


class TaskAssignWorkersSerializer(serializers.Serializer):
    worker_ids = serializers.ListField(child=serializers.IntegerField(), allow_empty=True)
    assigned_by_id = serializers.IntegerField(required=False, allow_null=True)
    note = serializers.CharField(required=False, allow_blank=True)


class TaskCommentCreateSerializer(serializers.ModelSerializer):
    author_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = TaskCommentRecord
        fields = ["comment_type", "message", "author_id"]


class TaskStatusActionSerializer(serializers.Serializer):
    note = serializers.CharField(required=False, allow_blank=True)
    reason = serializers.CharField(required=False, allow_blank=True)
    new_start_at = serializers.DateTimeField(required=False)
    new_end_at = serializers.DateTimeField(required=False)
    actor_id = serializers.IntegerField(required=False, allow_null=True)
