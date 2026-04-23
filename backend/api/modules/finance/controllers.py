from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

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
from api.modules.finance.serializers import (
    ExpenseCategorySerializer,
    ExpenseRecordSerializer,
    ExpenseRecordWriteSerializer,
    FinancePartnerSerializer,
    FinanceTransactionSerializer,
    FinanceTransactionWriteSerializer,
    RecurringExpenseSerializer,
    RecurringExpenseWriteSerializer,
    SalesDealSerializer,
    SalesDealWriteSerializer,
    SalesDeliverySerializer,
    SalesDeliveryWriteSerializer,
)


class FinancePartnersViewSet(viewsets.ModelViewSet):
    queryset = FinancePartner.objects.none()
    serializer_class = FinancePartnerSerializer

    def get_queryset(self):
        queryset = database.finance_partners_queryset()
        if partner_type := self.request.query_params.get("partner_type"):
            queryset = queryset.filter(partner_type=partner_type)
        if search := self.request.query_params.get("search"):
            queryset = queryset.filter(name__icontains=search)
        return queryset


class ExpenseCategoriesViewSet(viewsets.ModelViewSet):
    queryset = ExpenseCategory.objects.none()
    serializer_class = ExpenseCategorySerializer

    def get_queryset(self):
        queryset = database.expense_categories_queryset()
        if category_type := self.request.query_params.get("category_type"):
            queryset = queryset.filter(category_type=category_type)
        if search := self.request.query_params.get("search"):
            queryset = queryset.filter(name__icontains=search)
        return queryset


class RecurringExpensesViewSet(viewsets.ModelViewSet):
    queryset = RecurringExpense.objects.none()

    def get_queryset(self):
        return database.filter_recurring_expenses(
            database.recurring_expenses_queryset(),
            self.request.query_params,
        )

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return RecurringExpenseWriteSerializer
        return RecurringExpenseSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        recurring = database.save_serializer(serializer)
        return Response(
            RecurringExpenseSerializer(database.get_recurring_expense(recurring.pk)).data,
            status=status.HTTP_201_CREATED,
        )

    def partial_update(self, request, *args, **kwargs):
        recurring = self.get_object()
        serializer = self.get_serializer(recurring, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        database.save_serializer(serializer)
        return Response(RecurringExpenseSerializer(database.get_recurring_expense(recurring.pk)).data)


class ExpenseRecordsViewSet(viewsets.ModelViewSet):
    queryset = ExpenseRecord.objects.none()

    def get_queryset(self):
        return database.filter_expense_records(
            database.expense_records_queryset(),
            self.request.query_params,
        )

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return ExpenseRecordWriteSerializer
        return ExpenseRecordSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        expense = database.save_serializer(serializer)
        return Response(
            ExpenseRecordSerializer(database.get_expense_record(expense.pk)).data,
            status=status.HTTP_201_CREATED,
        )

    def partial_update(self, request, *args, **kwargs):
        expense = self.get_object()
        serializer = self.get_serializer(expense, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        database.save_serializer(serializer)
        return Response(ExpenseRecordSerializer(database.get_expense_record(expense.pk)).data)


class SalesDealsViewSet(viewsets.ModelViewSet):
    queryset = SalesDeal.objects.none()

    def get_queryset(self):
        return database.filter_sales_deals(
            database.sales_deals_queryset(),
            self.request.query_params,
        )

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return SalesDealWriteSerializer
        return SalesDealSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        deal = database.save_serializer(serializer)
        return Response(
            SalesDealSerializer(database.get_sales_deal(deal.pk)).data,
            status=status.HTTP_201_CREATED,
        )

    def partial_update(self, request, *args, **kwargs):
        deal = self.get_object()
        serializer = self.get_serializer(deal, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        database.save_serializer(serializer)
        return Response(SalesDealSerializer(database.get_sales_deal(deal.pk)).data)


class SalesDeliveriesViewSet(viewsets.ModelViewSet):
    queryset = SalesDelivery.objects.none()

    def get_queryset(self):
        return database.filter_sales_deliveries(
            database.sales_deliveries_queryset(),
            self.request.query_params,
        )

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return SalesDeliveryWriteSerializer
        return SalesDeliverySerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        delivery = database.save_serializer(serializer)
        return Response(
            SalesDeliverySerializer(database.get_sales_delivery(delivery.pk)).data,
            status=status.HTTP_201_CREATED,
        )

    def partial_update(self, request, *args, **kwargs):
        delivery = self.get_object()
        serializer = self.get_serializer(delivery, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        database.save_serializer(serializer)
        return Response(SalesDeliverySerializer(database.get_sales_delivery(delivery.pk)).data)


class FinanceTransactionsViewSet(viewsets.ModelViewSet):
    queryset = FinanceTransaction.objects.none()

    def get_queryset(self):
        return database.filter_finance_transactions(
            database.finance_transactions_queryset(),
            self.request.query_params,
        )

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return FinanceTransactionWriteSerializer
        return FinanceTransactionSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        transaction = database.save_serializer(serializer)
        return Response(
            FinanceTransactionSerializer(database.get_finance_transaction(transaction.pk)).data,
            status=status.HTTP_201_CREATED,
        )

    def partial_update(self, request, *args, **kwargs):
        transaction = self.get_object()
        serializer = self.get_serializer(transaction, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        database.save_serializer(serializer)
        return Response(FinanceTransactionSerializer(database.get_finance_transaction(transaction.pk)).data)

    @action(detail=False, methods=["get"], url_path="dashboard")
    def dashboard(self, request):
        return Response(database.finance_dashboard(request.query_params))
