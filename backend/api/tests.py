from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from api.modules.finance.models import (
    ExpenseCategory,
    ExpenseRecord,
    FinancePartner,
    FinanceTransaction,
    RecurringExpense,
    SalesDeal,
    SalesDelivery,
)
from api.modules.inventory.models import InventoryCategory, InventoryItem, InventoryMovement
from api.modules.plants.models import Farm, HarvestHistoryEntry, Plant, PlantStage, Plot
from api.modules.tasks.models import RecurringTaskPlan, ResourceUsageEntry, Task, TaskAssignmentRecord, TaskCommentRecord, TaskHistoryEntry


User = get_user_model()


class TaskApiTests(APITestCase):
    def setUp(self):
        self.manager = User.objects.create_user(
            email="manager@test.farm",
            password="pass1234",
            full_name="Test Manager",
            role="manager",
        )
        self.worker = User.objects.create_user(
            email="worker@test.farm",
            password="pass1234",
            full_name="Test Worker",
            role="worker",
        )
        self.farm = Farm.objects.create(name="Test Farm", manager=self.manager)
        self.stage, _ = PlantStage.objects.get_or_create(name="Seedling", defaults={"sort_order": 10})
        self.plot = Plot.objects.create(farm=self.farm, name="Plot A")
        self.plant = Plant.objects.create(
            plot=self.plot,
            stage=self.stage,
            name="Tomato",
            quantity=12,
        )
        self.task = Task.objects.create(
            plant=self.plant,
            title="Irrigate Plot A",
            description="Morning irrigation cycle",
            category="irrigation",
            priority="high",
            status="scheduled",
            scheduled_start_at=timezone.now(),
            scheduled_end_at=timezone.now() + timedelta(hours=2),
            created_by=self.manager,
        )
        TaskAssignmentRecord.objects.create(
            task=self.task,
            worker=self.worker,
            assigned_by=self.manager,
        )

    def test_manager_can_list_tasks(self):
        response = self.client.get(reverse("tasks-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_worker_filter_limits_tasks(self):
        response = self.client.get(reverse("tasks-list"), {"worker": self.worker.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_dashboard_endpoint_returns_summary(self):
        response = self.client.get(reverse("tasks-dashboard"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["summary"]["tasks_today"], 1)


class SampleDataCommandTests(TestCase):
    def test_seed_demo_data_populates_every_project_table(self):
        call_command("seed_demo_data", reset=True, verbosity=0)

        expected_models = [
            get_user_model(),
            Farm,
            Plot,
            PlantStage,
            Plant,
            RecurringTaskPlan,
            Task,
            TaskAssignmentRecord,
            TaskCommentRecord,
            TaskHistoryEntry,
            HarvestHistoryEntry,
            ResourceUsageEntry,
            FinancePartner,
            ExpenseCategory,
            RecurringExpense,
            ExpenseRecord,
            SalesDeal,
            SalesDelivery,
            FinanceTransaction,
            InventoryCategory,
            InventoryItem,
            InventoryMovement,
        ]

        for model in expected_models:
            with self.subTest(model=model.__name__):
                self.assertGreater(model.objects.count(), 0)
