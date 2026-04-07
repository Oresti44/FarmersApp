from datetime import timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import TaskAssignment, WorkTask


User = get_user_model()


class WorkTaskApiTests(APITestCase):
    def setUp(self):
        self.manager = User.objects.create_user(username="manager", password="pass1234")
        self.worker = User.objects.create_user(username="worker1", password="pass1234")
        self.task = WorkTask.objects.create(
            title="Irrigate Field A",
            description="Morning irrigation cycle",
            category="irrigation",
            priority="high",
            status="scheduled",
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(hours=2),
            estimated_duration_minutes=120,
            created_by=self.manager,
            location="Field A",
            related_entity_type="field",
            related_entity_name="Field A",
        )
        TaskAssignment.objects.create(
            task=self.task,
            worker=self.worker,
            assigned_by=self.manager,
            response="accepted",
        )

    def test_manager_can_list_tasks(self):
        response = self.client.get(reverse("tasks-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_worker_scope_filters_tasks(self):
        response = self.client.get(
            reverse("tasks-list"),
            {"acting_as": "worker", "username": "worker1"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_dashboard_endpoint_returns_overview(self):
        response = self.client.get(reverse("task-dashboard"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["overview"]["total_tasks"], 1)
