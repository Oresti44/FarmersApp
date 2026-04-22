from django.db import models
from django.utils import timezone

from api.modules.plants.models import Plant


class RecurringTaskPlan(models.Model):
    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("urgent", "Urgent"),
    ]
    FREQUENCY_CHOICES = [
        ("daily", "Daily"),
        ("weekly", "Weekly"),
        ("monthly", "Monthly"),
    ]

    plant = models.ForeignKey(Plant, related_name="recurring_series", on_delete=models.CASCADE)
    title = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, default="general")
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default="medium")
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    interval_value = models.PositiveIntegerField(default=1)
    weekdays_text = models.CharField(max_length=50, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    time_of_day = models.TimeField()
    default_duration_minutes = models.PositiveIntegerField(default=60)
    required_items_text = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        "api.User",
        db_column="created_by",
        related_name="created_recurring_task_plans",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    last_updated_by = models.ForeignKey(
        "api.User",
        db_column="last_updated_by",
        related_name="updated_recurring_task_plans",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "recurring_task_series"
        ordering = ["title", "start_date"]
        constraints = [
            models.CheckConstraint(
                check=models.Q(end_date__isnull=True) | models.Q(end_date__gte=models.F("start_date")),
                name="chk_series_end_date",
            ),
            models.CheckConstraint(check=models.Q(interval_value__gt=0), name="chk_series_interval_positive"),
            models.CheckConstraint(
                check=models.Q(default_duration_minutes__gt=0),
                name="chk_series_duration_positive",
            ),
        ]

    def __str__(self):
        return self.title


class Task(models.Model):
    PRIORITY_CHOICES = RecurringTaskPlan.PRIORITY_CHOICES
    STATUS_CHOICES = [
        ("scheduled", "Scheduled"),
        ("in_progress", "In Progress"),
        ("completed_pending_confirmation", "Completed Pending Confirmation"),
        ("completed", "Completed"),
        ("postponed", "Postponed"),
        ("cancelled", "Cancelled"),
    ]

    recurring_series = models.ForeignKey(
        RecurringTaskPlan,
        related_name="tasks",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    plant = models.ForeignKey(Plant, related_name="tasks", on_delete=models.CASCADE)
    title = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, default="general")
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default="medium")
    status = models.CharField(max_length=40, choices=STATUS_CHOICES, default="scheduled")
    scheduled_start_at = models.DateTimeField()
    scheduled_end_at = models.DateTimeField()
    actual_start_at = models.DateTimeField(null=True, blank=True)
    worker_completed_at = models.DateTimeField(null=True, blank=True)
    manager_confirmed_at = models.DateTimeField(null=True, blank=True)
    required_items_text = models.TextField(blank=True)
    worker_note = models.TextField(blank=True)
    manager_note = models.TextField(blank=True)
    postponement_reason = models.TextField(blank=True)
    cancellation_reason = models.TextField(blank=True)
    completion_confirmation_note = models.TextField(blank=True)
    created_by = models.ForeignKey(
        "api.User",
        db_column="created_by",
        related_name="created_tasks_v2",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    last_updated_by = models.ForeignKey(
        "api.User",
        db_column="last_updated_by",
        related_name="updated_tasks_v2",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "tasks"
        ordering = ["scheduled_start_at", "priority", "title"]
        constraints = [
            models.CheckConstraint(
                check=models.Q(scheduled_end_at__gt=models.F("scheduled_start_at")),
                name="chk_task_time_order",
            ),
            models.CheckConstraint(
                check=(
                    models.Q(manager_confirmed_at__isnull=True)
                    | models.Q(worker_completed_at__isnull=True)
                    | models.Q(manager_confirmed_at__gte=models.F("worker_completed_at"))
                ),
                name="chk_task_completion_time_order",
            ),
        ]

    @property
    def area(self):
        return self.plant.area

    @property
    def farm(self):
        return self.plant.farm

    @property
    def notes(self):
        return self.manager_note

    def __str__(self):
        return self.title


class TaskAssignmentRecord(models.Model):
    task = models.ForeignKey(Task, related_name="assignments", on_delete=models.CASCADE)
    worker = models.ForeignKey(
        "api.User",
        related_name="task_assignments_v2",
        on_delete=models.CASCADE,
    )
    assigned_by = models.ForeignKey(
        "api.User",
        db_column="assigned_by",
        related_name="assigned_tasks_v2",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "task_assignments"
        ordering = ["worker__full_name", "id"]
        constraints = [
            models.UniqueConstraint(fields=["task", "worker"], name="uq_task_worker"),
        ]

    def __str__(self):
        return f"{self.task} -> {self.worker}"


class TaskCommentRecord(models.Model):
    COMMENT_TYPE_CHOICES = [
        ("note", "Note"),
        ("issue", "Issue"),
        ("delay", "Delay"),
        ("completion", "Completion"),
    ]

    task = models.ForeignKey(Task, related_name="comments", on_delete=models.CASCADE)
    author = models.ForeignKey(
        "api.User",
        related_name="task_comments_v2",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    comment_type = models.CharField(max_length=20, choices=COMMENT_TYPE_CHOICES, default="note")
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "task_comments"
        ordering = ["-created_at", "-id"]

    def __str__(self):
        return f"{self.task}: {self.comment_type}"


class TaskHistoryEntry(models.Model):
    task = models.ForeignKey(Task, related_name="history_entries", on_delete=models.CASCADE)
    actor = models.ForeignKey(
        "api.User",
        related_name="task_history_entries_v2",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    action_type = models.CharField(max_length=50)
    field_name = models.CharField(max_length=100, blank=True)
    old_value = models.TextField(blank=True)
    new_value = models.TextField(blank=True)
    action_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "task_history"
        ordering = ["-created_at", "-id"]

    def __str__(self):
        return f"{self.task}: {self.action_type}"


class ResourceUsageEntry(models.Model):
    plant = models.ForeignKey(Plant, related_name="resource_usage", on_delete=models.CASCADE)
    task = models.ForeignKey(Task, related_name="resource_usage", on_delete=models.SET_NULL, null=True, blank=True)
    resource_name = models.CharField(max_length=120)
    resource_type = models.CharField(max_length=50)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    quantity_unit = models.CharField(max_length=30)
    used_at = models.DateTimeField(default=timezone.now)
    notes = models.TextField(blank=True)
    recorded_by = models.ForeignKey(
        "api.User",
        db_column="recorded_by",
        related_name="resource_usage_records",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "resource_usage"
        ordering = ["-used_at", "-id"]
        constraints = [
            models.CheckConstraint(check=models.Q(quantity__gte=0), name="chk_resource_quantity_non_negative"),
        ]

    def __str__(self):
        return f"{self.plant}: {self.resource_name}"
