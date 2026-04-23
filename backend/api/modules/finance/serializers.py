from rest_framework import serializers

from api import database
from api.modules.finance.models import (
    ExpenseCategory,
    ExpenseRecord,
    FinancePartner,
    FinanceTransaction,
    RecurringExpense,
    SalesDeal,
    SalesDelivery,
)
from api.modules.plants.serializers import FarmSummarySerializer
from api.modules.shared.serializers import UserSlimSerializer


class FinancePartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancePartner
        fields = [
            "id",
            "name",
            "partner_type",
            "contact_person",
            "phone",
            "email",
            "address_text",
            "notes",
            "created_at",
            "updated_at",
        ]


class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = ["id", "name", "category_type", "description"]


class FinancePlantSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    variety = serializers.CharField()
    status = serializers.CharField()


class FinanceTaskSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    status = serializers.CharField()
    priority = serializers.CharField()


class RecurringExpenseSerializer(serializers.ModelSerializer):
    farm = FarmSummarySerializer(read_only=True)
    category = ExpenseCategorySerializer(read_only=True)
    partner = FinancePartnerSerializer(read_only=True)
    created_by = UserSlimSerializer(read_only=True)
    last_updated_by = UserSlimSerializer(read_only=True)

    class Meta:
        model = RecurringExpense
        fields = [
            "id",
            "farm",
            "category",
            "partner",
            "title",
            "description",
            "amount",
            "frequency",
            "start_date",
            "end_date",
            "next_due_date",
            "status",
            "created_by",
            "last_updated_by",
            "created_at",
            "updated_at",
        ]


class RecurringExpenseWriteSerializer(serializers.ModelSerializer):
    farm_id = serializers.PrimaryKeyRelatedField(source="farm", queryset=database.farms_queryset())
    category_id = serializers.PrimaryKeyRelatedField(source="category", queryset=database.expense_categories_queryset())
    partner_id = serializers.PrimaryKeyRelatedField(
        source="partner",
        queryset=database.finance_partners_queryset(),
        required=False,
        allow_null=True,
    )
    created_by_id = serializers.IntegerField(required=False, allow_null=True, write_only=True)
    last_updated_by_id = serializers.IntegerField(required=False, allow_null=True, write_only=True)

    class Meta:
        model = RecurringExpense
        fields = [
            "id",
            "farm_id",
            "category_id",
            "partner_id",
            "title",
            "description",
            "amount",
            "frequency",
            "start_date",
            "end_date",
            "next_due_date",
            "status",
            "created_by_id",
            "last_updated_by_id",
        ]


class ExpenseRecordSerializer(serializers.ModelSerializer):
    farm = FarmSummarySerializer(read_only=True)
    category = ExpenseCategorySerializer(read_only=True)
    partner = FinancePartnerSerializer(read_only=True)
    recurring_expense_summary = serializers.SerializerMethodField()
    task_summary = serializers.SerializerMethodField()
    plant_summary = serializers.SerializerMethodField()
    worker = UserSlimSerializer(read_only=True)
    recorded_by = UserSlimSerializer(read_only=True)

    class Meta:
        model = ExpenseRecord
        fields = [
            "id",
            "farm",
            "category",
            "partner",
            "recurring_expense",
            "recurring_expense_summary",
            "task",
            "task_summary",
            "plant",
            "plant_summary",
            "title",
            "description",
            "expense_kind",
            "amount",
            "expense_date",
            "due_date",
            "payment_status",
            "worker",
            "pay_period_start",
            "pay_period_end",
            "recorded_by",
            "created_at",
            "updated_at",
        ]

    def get_recurring_expense_summary(self, obj):
        if not obj.recurring_expense:
            return None
        return {
            "id": obj.recurring_expense.id,
            "title": obj.recurring_expense.title,
            "frequency": obj.recurring_expense.frequency,
            "status": obj.recurring_expense.status,
        }

    def get_task_summary(self, obj):
        if not obj.task:
            return None
        return {
            "id": obj.task.id,
            "title": obj.task.title,
            "status": obj.task.status,
            "priority": obj.task.priority,
        }

    def get_plant_summary(self, obj):
        if not obj.plant:
            return None
        return {
            "id": obj.plant.id,
            "name": obj.plant.name,
            "variety": obj.plant.variety,
            "status": obj.plant.status,
        }


class ExpenseRecordWriteSerializer(serializers.ModelSerializer):
    farm_id = serializers.PrimaryKeyRelatedField(source="farm", queryset=database.farms_queryset())
    category_id = serializers.PrimaryKeyRelatedField(source="category", queryset=database.expense_categories_queryset())
    partner_id = serializers.PrimaryKeyRelatedField(
        source="partner",
        queryset=database.finance_partners_queryset(),
        required=False,
        allow_null=True,
    )
    recurring_expense_id = serializers.PrimaryKeyRelatedField(
        source="recurring_expense",
        queryset=database.recurring_expenses_queryset(),
        required=False,
        allow_null=True,
    )
    recorded_by_id = serializers.IntegerField(required=False, allow_null=True, write_only=True)
    worker_id = serializers.IntegerField(required=False, allow_null=True, write_only=True)

    class Meta:
        model = ExpenseRecord
        fields = [
            "id",
            "farm_id",
            "category_id",
            "partner_id",
            "recurring_expense_id",
            "task",
            "plant",
            "title",
            "description",
            "expense_kind",
            "amount",
            "expense_date",
            "due_date",
            "payment_status",
            "worker_id",
            "pay_period_start",
            "pay_period_end",
            "recorded_by_id",
        ]


class SalesDealSerializer(serializers.ModelSerializer):
    farm = FarmSummarySerializer(read_only=True)
    buyer = FinancePartnerSerializer(read_only=True)
    plant_summary = serializers.SerializerMethodField()
    created_by = UserSlimSerializer(read_only=True)
    last_updated_by = UserSlimSerializer(read_only=True)
    delivery_count = serializers.SerializerMethodField()

    class Meta:
        model = SalesDeal
        fields = [
            "id",
            "farm",
            "buyer",
            "plant",
            "plant_summary",
            "title",
            "description",
            "product_name",
            "agreed_quantity",
            "quantity_unit",
            "frequency",
            "interval_value",
            "unit_price",
            "start_date",
            "end_date",
            "status",
            "created_by",
            "last_updated_by",
            "delivery_count",
            "created_at",
            "updated_at",
        ]

    def get_plant_summary(self, obj):
        if not obj.plant:
            return None
        return {
            "id": obj.plant.id,
            "name": obj.plant.name,
            "variety": obj.plant.variety,
            "status": obj.plant.status,
        }

    def get_delivery_count(self, obj):
        return len(obj.deliveries.all())


class SalesDealWriteSerializer(serializers.ModelSerializer):
    farm_id = serializers.PrimaryKeyRelatedField(source="farm", queryset=database.farms_queryset())
    buyer_id = serializers.PrimaryKeyRelatedField(source="buyer", queryset=database.finance_partners_queryset())
    created_by_id = serializers.IntegerField(required=False, allow_null=True, write_only=True)
    last_updated_by_id = serializers.IntegerField(required=False, allow_null=True, write_only=True)

    class Meta:
        model = SalesDeal
        fields = [
            "id",
            "farm_id",
            "buyer_id",
            "plant",
            "title",
            "description",
            "product_name",
            "agreed_quantity",
            "quantity_unit",
            "frequency",
            "interval_value",
            "unit_price",
            "start_date",
            "end_date",
            "status",
            "created_by_id",
            "last_updated_by_id",
        ]


class SalesDeliverySerializer(serializers.ModelSerializer):
    deal_summary = serializers.SerializerMethodField()
    harvest_summary = serializers.SerializerMethodField()
    recorded_by = UserSlimSerializer(read_only=True)

    class Meta:
        model = SalesDelivery
        fields = [
            "id",
            "deal",
            "deal_summary",
            "harvest_history",
            "harvest_summary",
            "scheduled_date",
            "delivered_date",
            "quantity_delivered",
            "quantity_unit",
            "unit_price",
            "total_amount",
            "payment_status",
            "due_date",
            "notes",
            "recorded_by",
            "created_at",
            "updated_at",
        ]

    def get_deal_summary(self, obj):
        return {
            "id": obj.deal.id,
            "title": obj.deal.title,
            "product_name": obj.deal.product_name,
            "buyer_name": obj.deal.buyer.name,
            "farm_name": obj.deal.farm.name,
        }

    def get_harvest_summary(self, obj):
        if not obj.harvest_history:
            return None
        return {
            "id": obj.harvest_history.id,
            "harvested_at": obj.harvest_history.harvested_at,
            "quantity": obj.harvest_history.quantity,
            "quantity_unit": obj.harvest_history.quantity_unit,
        }


class SalesDeliveryWriteSerializer(serializers.ModelSerializer):
    recorded_by_id = serializers.IntegerField(required=False, allow_null=True, write_only=True)

    class Meta:
        model = SalesDelivery
        fields = [
            "id",
            "deal",
            "harvest_history",
            "scheduled_date",
            "delivered_date",
            "quantity_delivered",
            "quantity_unit",
            "unit_price",
            "total_amount",
            "payment_status",
            "due_date",
            "notes",
            "recorded_by_id",
        ]


class FinanceTransactionSerializer(serializers.ModelSerializer):
    farm = FarmSummarySerializer(read_only=True)
    source_summary = serializers.SerializerMethodField()
    created_by = UserSlimSerializer(read_only=True)

    class Meta:
        model = FinanceTransaction
        fields = [
            "id",
            "farm",
            "transaction_type",
            "source_type",
            "expense_record",
            "sales_delivery",
            "source_summary",
            "transaction_date",
            "amount",
            "payment_method",
            "note",
            "created_by",
            "created_at",
        ]

    def get_source_summary(self, obj):
        if obj.expense_record:
            return {
                "id": obj.expense_record.id,
                "title": obj.expense_record.title,
                "status": obj.expense_record.payment_status,
                "partner_name": obj.expense_record.partner.name if obj.expense_record.partner else "",
                "category_name": obj.expense_record.category.name,
            }
        if obj.sales_delivery:
            return {
                "id": obj.sales_delivery.id,
                "title": obj.sales_delivery.deal.title,
                "status": obj.sales_delivery.payment_status,
                "partner_name": obj.sales_delivery.deal.buyer.name,
                "category_name": obj.sales_delivery.deal.product_name,
            }
        return None


class FinanceTransactionWriteSerializer(serializers.ModelSerializer):
    farm_id = serializers.PrimaryKeyRelatedField(source="farm", queryset=database.farms_queryset())
    created_by_id = serializers.IntegerField(required=False, allow_null=True, write_only=True)

    class Meta:
        model = FinanceTransaction
        fields = [
            "id",
            "farm_id",
            "transaction_type",
            "source_type",
            "expense_record",
            "sales_delivery",
            "transaction_date",
            "amount",
            "payment_method",
            "note",
            "created_by_id",
        ]
