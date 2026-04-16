from rest_framework import serializers


def validate_task_payload(data, instance=None):
    plant = data.get("plant", getattr(instance, "plant", None))
    start_at = data.get("scheduled_start_at", getattr(instance, "scheduled_start_at", None))
    end_at = data.get("scheduled_end_at", getattr(instance, "scheduled_end_at", None))

    if not plant:
        raise serializers.ValidationError({"plant_id": "Task must have a valid plant."})
    if start_at and end_at and end_at <= start_at:
        raise serializers.ValidationError({"scheduled_end_at": "Task end must be after task start."})


def validate_recurrence_payload(recurrence):
    if not recurrence:
        return

    start_date = recurrence.get("start_date")
    end_date = recurrence.get("end_date")
    if end_date and start_date and end_date < start_date:
        raise serializers.ValidationError({"recurrence": "Recurring series end date cannot be before start date."})
