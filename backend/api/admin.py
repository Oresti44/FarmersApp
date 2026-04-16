from django.contrib import admin

from .models import (
    Farm,
    Greenhouse,
    HarvestHistoryEntry,
    Plant,
    PlantStage,
    Plot,
    RecurringTaskPlan,
    RecurringTaskSeries,
    ResourceUsageEntry,
    Task,
    TaskAssignment,
    TaskAssignmentRecord,
    TaskChecklistItem,
    TaskComment,
    TaskCommentRecord,
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
admin.site.register(Farm)
admin.site.register(Plot)
admin.site.register(Greenhouse)
admin.site.register(PlantStage)
admin.site.register(Plant)
admin.site.register(HarvestHistoryEntry)
admin.site.register(ResourceUsageEntry)
admin.site.register(RecurringTaskPlan)
admin.site.register(Task)
admin.site.register(TaskAssignmentRecord)
admin.site.register(TaskCommentRecord)
