from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import (
    RecurringTaskSeries,
    TaskAssignment,
    TaskChecklistItem,
    TaskComment,
    TaskHistory,
    TaskTemplate,
    WorkTask,
    WorkerGroup,
)


User = get_user_model()


class UserSlimSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email"]


class WorkerGroupSerializer(serializers.ModelSerializer):
    members = UserSlimSerializer(many=True, read_only=True)
    member_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source="members",
        many=True,
        write_only=True,
        required=False,
    )

    class Meta:
        model = WorkerGroup
        fields = [
            "id",
            "name",
            "description",
            "members",
            "member_ids",
            "created_at",
            "updated_at",
        ]


class TaskTemplateSerializer(serializers.ModelSerializer):
    created_by = UserSlimSerializer(read_only=True)
    created_by_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source="created_by",
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = TaskTemplate
        fields = "__all__"


class RecurringTaskSeriesSerializer(serializers.ModelSerializer):
    created_by = UserSlimSerializer(read_only=True)
    created_by_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source="created_by",
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = RecurringTaskSeries
        fields = "__all__"


class TaskChecklistItemSerializer(serializers.ModelSerializer):
    completed_by = UserSlimSerializer(read_only=True)

    class Meta:
        model = TaskChecklistItem
        fields = "__all__"


class TaskCommentSerializer(serializers.ModelSerializer):
    author = UserSlimSerializer(read_only=True)
    author_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source="author",
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = TaskComment
        fields = "__all__"


class TaskHistorySerializer(serializers.ModelSerializer):
    actor = UserSlimSerializer(read_only=True)

    class Meta:
        model = TaskHistory
        fields = "__all__"


class TaskAssignmentSerializer(serializers.ModelSerializer):
    worker = UserSlimSerializer(read_only=True)
    worker_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source="worker",
        write_only=True,
    )
    assigned_by = UserSlimSerializer(read_only=True)
    assigned_by_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source="assigned_by",
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = TaskAssignment
        fields = "__all__"


class WorkTaskSerializer(serializers.ModelSerializer):
    created_by = UserSlimSerializer(read_only=True)
    created_by_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source="created_by",
        write_only=True,
        required=False,
        allow_null=True,
    )
    last_status_changed_by = UserSlimSerializer(read_only=True)
    last_status_changed_by_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source="last_status_changed_by",
        write_only=True,
        required=False,
        allow_null=True,
    )
    assigned_group = WorkerGroupSerializer(read_only=True)
    assigned_group_id = serializers.PrimaryKeyRelatedField(
        queryset=WorkerGroup.objects.all(),
        source="assigned_group",
        write_only=True,
        required=False,
        allow_null=True,
    )
    recurring_series = RecurringTaskSeriesSerializer(read_only=True)
    recurring_series_id = serializers.PrimaryKeyRelatedField(
        queryset=RecurringTaskSeries.objects.all(),
        source="recurring_series",
        write_only=True,
        required=False,
        allow_null=True,
    )
    parent_task_id = serializers.PrimaryKeyRelatedField(
        queryset=WorkTask.objects.all(),
        source="parent_task",
        required=False,
        allow_null=True,
    )
    assigned_workers = UserSlimSerializer(many=True, read_only=True)
    assigned_worker_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source="assigned_workers",
        many=True,
        write_only=True,
        required=False,
    )
    assignments = TaskAssignmentSerializer(many=True, read_only=True)
    checklist_items = TaskChecklistItemSerializer(many=True, read_only=True)
    comments = TaskCommentSerializer(many=True, read_only=True)
    history_entries = TaskHistorySerializer(many=True, read_only=True)
    dependency_ids = serializers.PrimaryKeyRelatedField(
        queryset=WorkTask.objects.all(),
        source="can_start_after",
        many=True,
        write_only=True,
        required=False,
    )
    dependencies = serializers.SerializerMethodField()

    class Meta:
        model = WorkTask
        fields = "__all__"

    def get_dependencies(self, obj):
        return [{"id": task.id, "title": task.title, "status": task.status} for task in obj.can_start_after.all()]

    def create(self, validated_data):
        assigned_workers = validated_data.pop("assigned_workers", [])
        dependencies = validated_data.pop("can_start_after", [])
        task = super().create(validated_data)
        if assigned_workers:
            TaskAssignment.objects.bulk_create(
                [TaskAssignment(task=task, worker=worker) for worker in assigned_workers]
            )
        if dependencies:
            task.can_start_after.set(dependencies)
        return task

    def update(self, instance, validated_data):
        assigned_workers = validated_data.pop("assigned_workers", None)
        dependencies = validated_data.pop("can_start_after", None)
        task = super().update(instance, validated_data)
        if assigned_workers is not None:
            task.assignments.all().delete()
            TaskAssignment.objects.bulk_create(
                [TaskAssignment(task=task, worker=worker) for worker in assigned_workers]
            )
        if dependencies is not None:
            task.can_start_after.set(dependencies)
        return task
