from django.contrib import admin

from .models import (
    ExpenseCategory,
    ExpenseRecord,
    Farm,
    FinancePartner,
    FinanceTransaction,
    Greenhouse,
    HarvestHistoryEntry,
    InventoryCategory,
    InventoryItem,
    InventoryMovement,
    Plant,
    PlantStage,
    Plot,
    RecurringTaskPlan,
    RecurringExpense,
    ResourceUsageEntry,
    SalesDeal,
    SalesDelivery,
    Task,
    TaskAssignmentRecord,
    TaskCommentRecord,
    TaskHistoryEntry,
    User,
)


admin.site.register(User)
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
admin.site.register(TaskHistoryEntry)
admin.site.register(FinancePartner)
admin.site.register(ExpenseCategory)
admin.site.register(RecurringExpense)
admin.site.register(ExpenseRecord)
admin.site.register(SalesDeal)
admin.site.register(SalesDelivery)
admin.site.register(FinanceTransaction)
admin.site.register(InventoryCategory)
admin.site.register(InventoryItem)
admin.site.register(InventoryMovement)
