from django.db import models

from api.modules.plants.models import Farm, Plant
from api.modules.tasks.models import Task


class FinancePartner(models.Model):
    PARTNER_TYPE_CHOICES = [
        ("buyer", "Buyer"),
        ("supplier", "Supplier"),
        ("utility_provider", "Utility Provider"),
        ("other", "Other"),
    ]

    name = models.CharField(max_length=160)
    partner_type = models.CharField(max_length=30, choices=PARTNER_TYPE_CHOICES)
    contact_person = models.CharField(max_length=120, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(max_length=150, blank=True)
    address_text = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "finance_partners"
        ordering = ["name"]

    def __str__(self):
        return self.name


class ExpenseCategory(models.Model):
    CATEGORY_TYPE_CHOICES = [
        ("operational", "Operational"),
        ("recurring", "Recurring"),
        ("wages", "Wages"),
        ("tools", "Tools"),
        ("other", "Other"),
    ]

    name = models.CharField(max_length=100, unique=True)
    category_type = models.CharField(max_length=30, choices=CATEGORY_TYPE_CHOICES)
    description = models.TextField(blank=True)

    class Meta:
        db_table = "expense_categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class RecurringExpense(models.Model):
    FREQUENCY_CHOICES = [
        ("weekly", "Weekly"),
        ("monthly", "Monthly"),
        ("yearly", "Yearly"),
    ]
    STATUS_CHOICES = [
        ("active", "Active"),
        ("paused", "Paused"),
        ("ended", "Ended"),
    ]

    farm = models.ForeignKey(Farm, related_name="recurring_expenses", on_delete=models.CASCADE)
    category = models.ForeignKey(ExpenseCategory, related_name="recurring_expenses", on_delete=models.PROTECT)
    partner = models.ForeignKey(
        FinancePartner,
        related_name="recurring_expenses",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    title = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    next_due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    created_by = models.ForeignKey(
        "api.User",
        db_column="created_by",
        related_name="created_recurring_expenses",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    last_updated_by = models.ForeignKey(
        "api.User",
        db_column="last_updated_by",
        related_name="updated_recurring_expenses",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "recurring_expenses"
        ordering = ["next_due_date", "title"]
        constraints = [
            models.CheckConstraint(check=models.Q(amount__gte=0), name="chk_recurring_expenses_amount"),
            models.CheckConstraint(
                check=models.Q(end_date__isnull=True) | models.Q(end_date__gte=models.F("start_date")),
                name="chk_recurring_expenses_end_date",
            ),
            models.CheckConstraint(
                check=models.Q(next_due_date__gte=models.F("start_date")),
                name="chk_recurring_expenses_next_due_date",
            ),
        ]

    def __str__(self):
        return self.title


class ExpenseRecord(models.Model):
    EXPENSE_KIND_CHOICES = [
        ("manual", "Manual"),
        ("recurring_instance", "Recurring Instance"),
        ("wage", "Wage"),
    ]
    PAYMENT_STATUS_CHOICES = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("overdue", "Overdue"),
        ("cancelled", "Cancelled"),
    ]

    farm = models.ForeignKey(Farm, related_name="expense_records", on_delete=models.CASCADE)
    category = models.ForeignKey(ExpenseCategory, related_name="expense_records", on_delete=models.PROTECT)
    partner = models.ForeignKey(
        FinancePartner,
        related_name="expense_records",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    recurring_expense = models.ForeignKey(
        RecurringExpense,
        related_name="expense_records",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    task = models.ForeignKey(Task, related_name="expense_records", on_delete=models.SET_NULL, null=True, blank=True)
    plant = models.ForeignKey(Plant, related_name="expense_records", on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    expense_kind = models.CharField(max_length=20, choices=EXPENSE_KIND_CHOICES, default="manual")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    expense_date = models.DateField()
    due_date = models.DateField(null=True, blank=True)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default="paid")
    worker = models.ForeignKey(
        "api.User",
        related_name="wage_expense_records",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    pay_period_start = models.DateField(null=True, blank=True)
    pay_period_end = models.DateField(null=True, blank=True)
    recorded_by = models.ForeignKey(
        "api.User",
        db_column="recorded_by",
        related_name="recorded_expense_records",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "expense_records"
        ordering = ["-expense_date", "-id"]
        constraints = [
            models.CheckConstraint(check=models.Q(amount__gte=0), name="chk_expense_records_amount"),
            models.CheckConstraint(
                check=(
                    models.Q(pay_period_start__isnull=True, pay_period_end__isnull=True)
                    | (
                        models.Q(pay_period_start__isnull=False, pay_period_end__isnull=False)
                        & models.Q(pay_period_end__gte=models.F("pay_period_start"))
                    )
                ),
                name="chk_expense_records_pay_period",
            ),
            models.CheckConstraint(
                check=models.Q(due_date__isnull=True) | models.Q(due_date__gte=models.F("expense_date")),
                name="chk_expense_records_due_date",
            ),
        ]

    def __str__(self):
        return self.title


class SalesDeal(models.Model):
    FREQUENCY_CHOICES = [
        ("weekly", "Weekly"),
        ("monthly", "Monthly"),
    ]
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("active", "Active"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    farm = models.ForeignKey(Farm, related_name="sales_deals", on_delete=models.CASCADE)
    buyer = models.ForeignKey(FinancePartner, related_name="sales_deals", on_delete=models.PROTECT)
    plant = models.ForeignKey(Plant, related_name="sales_deals", on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    product_name = models.CharField(max_length=120)
    agreed_quantity = models.DecimalField(max_digits=12, decimal_places=2)
    quantity_unit = models.CharField(max_length=30, default="kg")
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    interval_value = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    created_by = models.ForeignKey(
        "api.User",
        db_column="created_by",
        related_name="created_sales_deals",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    last_updated_by = models.ForeignKey(
        "api.User",
        db_column="last_updated_by",
        related_name="updated_sales_deals",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "sales_deals"
        ordering = ["-start_date", "title"]
        constraints = [
            models.CheckConstraint(check=models.Q(agreed_quantity__gt=0), name="chk_sales_deals_quantity"),
            models.CheckConstraint(check=models.Q(interval_value__gt=0), name="chk_sales_deals_interval"),
            models.CheckConstraint(check=models.Q(unit_price__gte=0), name="chk_sales_deals_unit_price"),
            models.CheckConstraint(check=models.Q(end_date__gte=models.F("start_date")), name="chk_sales_deals_dates"),
        ]

    def __str__(self):
        return self.title


class SalesDelivery(models.Model):
    PAYMENT_STATUS_CHOICES = ExpenseRecord.PAYMENT_STATUS_CHOICES

    deal = models.ForeignKey(SalesDeal, related_name="deliveries", on_delete=models.CASCADE)
    harvest_history = models.ForeignKey(
        "api.HarvestHistoryEntry",
        related_name="sales_deliveries",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    scheduled_date = models.DateField()
    delivered_date = models.DateField(null=True, blank=True)
    quantity_delivered = models.DecimalField(max_digits=12, decimal_places=2)
    quantity_unit = models.CharField(max_length=30, default="kg")
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default="pending")
    due_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    recorded_by = models.ForeignKey(
        "api.User",
        db_column="recorded_by",
        related_name="recorded_sales_deliveries",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "sales_deliveries"
        ordering = ["-scheduled_date", "-id"]
        constraints = [
            models.CheckConstraint(check=models.Q(quantity_delivered__gte=0), name="chk_sales_deliveries_quantity"),
            models.CheckConstraint(check=models.Q(unit_price__gte=0), name="chk_sales_deliveries_unit_price"),
            models.CheckConstraint(check=models.Q(total_amount__gte=0), name="chk_sales_deliveries_total"),
            models.CheckConstraint(
                check=models.Q(due_date__isnull=True) | models.Q(due_date__gte=models.F("scheduled_date")),
                name="chk_sales_deliveries_due_date",
            ),
            models.CheckConstraint(
                check=models.Q(delivered_date__isnull=True) | models.Q(delivered_date__gte=models.F("scheduled_date")),
                name="chk_sales_deliveries_delivered_date",
            ),
        ]

    def __str__(self):
        return f"{self.deal} - {self.scheduled_date}"


class FinanceTransaction(models.Model):
    TRANSACTION_TYPE_CHOICES = [
        ("income", "Income"),
        ("expense", "Expense"),
    ]
    SOURCE_TYPE_CHOICES = [
        ("sale_delivery", "Sale Delivery"),
        ("expense_record", "Expense Record"),
    ]
    PAYMENT_METHOD_CHOICES = [
        ("cash", "Cash"),
        ("bank_transfer", "Bank Transfer"),
        ("card", "Card"),
        ("other", "Other"),
    ]

    farm = models.ForeignKey(Farm, related_name="finance_transactions", on_delete=models.CASCADE)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE_CHOICES)
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPE_CHOICES)
    expense_record = models.ForeignKey(
        ExpenseRecord,
        related_name="finance_transactions",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    sales_delivery = models.ForeignKey(
        SalesDelivery,
        related_name="finance_transactions",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    transaction_date = models.DateField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=30, choices=PAYMENT_METHOD_CHOICES, blank=True)
    note = models.TextField(blank=True)
    created_by = models.ForeignKey(
        "api.User",
        db_column="created_by",
        related_name="created_finance_transactions",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "finance_transactions"
        ordering = ["-transaction_date", "-id"]
        constraints = [
            models.CheckConstraint(check=models.Q(amount__gte=0), name="chk_finance_transactions_amount"),
            models.CheckConstraint(
                check=(
                    models.Q(
                        expense_record__isnull=False,
                        sales_delivery__isnull=True,
                        source_type="expense_record",
                        transaction_type="expense",
                    )
                    | models.Q(
                        expense_record__isnull=True,
                        sales_delivery__isnull=False,
                        source_type="sale_delivery",
                        transaction_type="income",
                    )
                ),
                name="chk_finance_transactions_one_source",
            ),
        ]

    def __str__(self):
        return f"{self.transaction_type}: {self.amount}"
