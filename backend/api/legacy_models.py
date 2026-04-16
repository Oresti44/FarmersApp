from django.conf import settings
from django.db import models


class WorkerGroup(models.Model):
    name = models.CharField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="worker_groups",
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class TaskTemplate(models.Model):
    CATEGORY_CHOICES = [
        ("irrigation", "Irrigation"),
        ("fertilizing", "Fertilizing"),
        ("spraying", "Spraying"),
        ("harvesting", "Harvesting"),
        ("feeding", "Feeding Animals"),
        ("cleaning", "Cleaning"),
        ("maintenance", "Maintenance"),
        ("transport", "Transport"),
        ("inspection", "Inspection"),
        ("general", "General"),
    ]

    name = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=40, choices=CATEGORY_CHOICES, default="general")
    priority = models.CharField(
        max_length=10,
        choices=[
            ("low", "Low"),
            ("medium", "Medium"),
            ("high", "High"),
            ("urgent", "Urgent"),
        ],
        default="medium",
    )
    estimated_duration_minutes = models.PositiveIntegerField(default=60)
    default_location = models.CharField(max_length=160, blank=True)
    default_required_items = models.JSONField(default=list, blank=True)
    default_checklist = models.JSONField(default=list, blank=True)
    instructions = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="task_templates",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class RecurringTaskSeries(models.Model):
    FREQUENCY_CHOICES = [
        ("daily", "Daily"),
        ("weekly", "Weekly"),
        ("monthly", "Monthly"),
        ("custom", "Custom"),
    ]

    title = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default="daily")
    weekdays = models.JSONField(default=list, blank=True)
    daily_time_slots = models.JSONField(default=list, blank=True)
    interval = models.PositiveIntegerField(default=1)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    occurrence_limit = models.PositiveIntegerField(null=True, blank=True)
    weather_warning = models.CharField(max_length=200, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="recurring_task_series",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Recurring task series"
        ordering = ["title", "start_date"]

    def __str__(self):
        return self.title


class WorkTask(models.Model):
    CATEGORY_CHOICES = TaskTemplate.CATEGORY_CHOICES
    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("urgent", "Urgent"),
    ]
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("scheduled", "Scheduled"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
        ("postponed", "Postponed"),
        ("missed", "Missed"),
        ("overdue", "Overdue"),
    ]
    ENTITY_TYPE_CHOICES = [
        ("field", "Field"),
        ("crop", "Crop"),
        ("livestock", "Livestock Group"),
        ("greenhouse", "Greenhouse"),
        ("equipment", "Equipment"),
        ("inventory", "Inventory Item"),
        ("other", "Other"),
    ]

    title = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=40, choices=CATEGORY_CHOICES, default="general")
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="medium")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    progress_percent = models.PositiveSmallIntegerField(default=0)
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    estimated_duration_minutes = models.PositiveIntegerField(default=60)
    actual_duration_minutes = models.PositiveIntegerField(default=0)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="created_work_tasks",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    assigned_workers = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through="TaskAssignment",
        through_fields=("task", "worker"),
        related_name="assigned_work_tasks",
        blank=True,
    )
    assigned_group = models.ForeignKey(
        WorkerGroup,
        related_name="tasks",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    location = models.CharField(max_length=160, blank=True)
    related_entity_type = models.CharField(
        max_length=20,
        choices=ENTITY_TYPE_CHOICES,
        default="other",
    )
    related_entity_name = models.CharField(max_length=160, blank=True)
    required_items = models.JSONField(default=list, blank=True)
    instructions = models.TextField(blank=True)
    attachments = models.JSONField(default=list, blank=True)
    completion_notes = models.TextField(blank=True)
    completion_proof = models.JSONField(default=list, blank=True)
    weather_note = models.CharField(max_length=200, blank=True)
    is_recurring = models.BooleanField(default=False)
    recurring_series = models.ForeignKey(
        RecurringTaskSeries,
        related_name="occurrences",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    occurrence_index = models.PositiveIntegerField(null=True, blank=True)
    parent_task = models.ForeignKey(
        "self",
        related_name="dependent_tasks",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    consumption_log = models.JSONField(default=list, blank=True)
    can_start_after = models.ManyToManyField(
        "self",
        symmetrical=False,
        related_name="unlocks",
        blank=True,
    )
    last_status_changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="task_status_changes",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    last_status_changed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["start_at", "priority", "title"]

    def __str__(self):
        return self.title


class TaskAssignment(models.Model):
    RESPONSE_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
        ("cannot_complete", "Cannot complete"),
        ("reschedule_requested", "Reschedule requested"),
    ]

    task = models.ForeignKey(WorkTask, related_name="assignments", on_delete=models.CASCADE)
    worker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="task_assignments",
        on_delete=models.CASCADE,
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="assigned_tasks_to_workers",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    response = models.CharField(max_length=24, choices=RESPONSE_CHOICES, default="pending")
    note = models.TextField(blank=True)

    class Meta:
        unique_together = ("task", "worker")
        ordering = ["worker__username"]

    def __str__(self):
        return f"{self.task} -> {self.worker}"


class TaskChecklistItem(models.Model):
    task = models.ForeignKey(WorkTask, related_name="checklist_items", on_delete=models.CASCADE)
    title = models.CharField(max_length=160)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    completed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="completed_checklist_items",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return self.title


class TaskComment(models.Model):
    COMMENT_TYPE_CHOICES = [
        ("note", "Note"),
        ("issue", "Issue"),
        ("delay", "Delay"),
        ("completion", "Completion"),
    ]

    task = models.ForeignKey(WorkTask, related_name="comments", on_delete=models.CASCADE)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="task_comments",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    comment_type = models.CharField(max_length=20, choices=COMMENT_TYPE_CHOICES, default="note")
    message = models.TextField()
    time_spent_minutes = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.comment_type}: {self.task}"


class TaskHistory(models.Model):
    task = models.ForeignKey(WorkTask, related_name="history_entries", on_delete=models.CASCADE)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="task_history_entries",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    action = models.CharField(max_length=80)
    before = models.JSONField(default=dict, blank=True)
    after = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Task history"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.task} - {self.action}"
