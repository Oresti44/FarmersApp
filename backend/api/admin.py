from django.contrib import admin

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


@admin.register(WorkTask)
class WorkTaskAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "status", "priority", "location", "start_at", "end_at")
    list_filter = ("status", "priority", "category", "is_recurring", "location")
    search_fields = ("title", "description", "location", "related_entity_name")
    filter_horizontal = ("can_start_after",)


admin.site.register(WorkerGroup)
admin.site.register(TaskTemplate)
admin.site.register(RecurringTaskSeries)
admin.site.register(TaskAssignment)
admin.site.register(TaskChecklistItem)
admin.site.register(TaskComment)
admin.site.register(TaskHistory)
