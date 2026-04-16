from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from api.modules.tasks.models import RecurringTaskPlan
from api.modules.tasks.repositories import TasksRepository
from api.modules.tasks.serializers import (
    RecurringTaskPlanSummarySerializer,
    TaskAssignWorkersSerializer,
    TaskCommentCreateSerializer,
    TaskCommentSerializer,
    TaskDetailSerializer,
    TaskHistorySerializer,
    TaskListSerializer,
    TaskStatusActionSerializer,
    TaskWriteSerializer,
)
from api.modules.tasks.services import (
    _assigned_workers,
    _task_delete_impact,
    add_comment,
    cancel_task,
    complete_task,
    confirm_completion,
    create_task,
    delete_task,
    postpone_task,
    start_task,
    task_activity,
    tasks_dashboard,
    update_task,
)


class TasksViewSet(viewsets.ModelViewSet):
    queryset = TasksRepository.queryset()

    def get_queryset(self):
        params = dict(self.request.query_params)
        flattened = {key: values[-1] for key, values in params.items()}
        flattened["reference_now"] = timezone.now()
        return TasksRepository.apply_filters(TasksRepository.queryset(), flattened)

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return TaskWriteSerializer
        if self.action == "retrieve":
            return TaskDetailSerializer
        return TaskListSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task = create_task(serializer.validated_data)
        return Response(
            TaskDetailSerializer(TasksRepository.queryset().get(pk=task.pk)).data,
            status=status.HTTP_201_CREATED,
        )

    def partial_update(self, request, *args, **kwargs):
        task = self.get_object()
        serializer = self.get_serializer(task, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        update_task(task, serializer.validated_data)
        return Response(TaskDetailSerializer(TasksRepository.queryset().get(pk=task.pk)).data)

    def destroy(self, request, *args, **kwargs):
        scope = request.query_params.get("scope", "task_only")
        impact = delete_task(self.get_object(), scope=scope)
        return Response({"deleted": impact})

    @action(detail=False, methods=["get"], url_path="dashboard")
    def dashboard(self, request):
        return Response(tasks_dashboard(self.get_queryset()))

    @action(detail=False, methods=["get"], url_path="activity")
    def activity(self, request):
        return Response(task_activity(self.get_queryset(), request.query_params))

    @action(detail=True, methods=["get"], url_path="comments")
    def comments(self, request, pk=None):
        task = self.get_object()
        return Response(TaskCommentSerializer(task.comments.all(), many=True).data)

    @action(detail=True, methods=["post"], url_path="comments")
    def add_comment_action(self, request, pk=None):
        serializer = TaskCommentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = add_comment(
            self.get_object(),
            serializer.validated_data["comment_type"],
            serializer.validated_data["message"],
            serializer.validated_data.get("author_id"),
        )
        return Response(TaskCommentSerializer(comment).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"], url_path="history")
    def history(self, request, pk=None):
        task = self.get_object()
        return Response(TaskHistorySerializer(task.history_entries.all(), many=True).data)

    @action(detail=True, methods=["post"], url_path="assign-workers")
    def assign_workers(self, request, pk=None):
        serializer = TaskAssignWorkersSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        _assigned_workers(
            self.get_object(),
            serializer.validated_data["worker_ids"],
            serializer.validated_data.get("assigned_by_id"),
            serializer.validated_data.get("note", ""),
        )
        task = TasksRepository.queryset().get(pk=pk)
        return Response(TaskDetailSerializer(task).data)

    @action(detail=True, methods=["post"], url_path="start")
    def start(self, request, pk=None):
        serializer = TaskStatusActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task = start_task(
            self.get_object(),
            serializer.validated_data.get("actor_id"),
            serializer.validated_data.get("note", ""),
        )
        return Response(TaskDetailSerializer(TasksRepository.queryset().get(pk=task.pk)).data)

    @action(detail=True, methods=["post"], url_path="complete")
    def complete(self, request, pk=None):
        serializer = TaskStatusActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task = complete_task(
            self.get_object(),
            serializer.validated_data.get("actor_id"),
            serializer.validated_data.get("note", ""),
        )
        return Response(TaskDetailSerializer(TasksRepository.queryset().get(pk=task.pk)).data)

    @action(detail=True, methods=["post"], url_path="confirm-completion")
    def confirm_completion(self, request, pk=None):
        serializer = TaskStatusActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task = confirm_completion(
            self.get_object(),
            serializer.validated_data.get("actor_id"),
            serializer.validated_data.get("note", ""),
        )
        return Response(TaskDetailSerializer(TasksRepository.queryset().get(pk=task.pk)).data)

    @action(detail=True, methods=["post"], url_path="postpone")
    def postpone(self, request, pk=None):
        serializer = TaskStatusActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task = postpone_task(
            self.get_object(),
            serializer.validated_data.get("actor_id"),
            serializer.validated_data.get("reason", ""),
            serializer.validated_data.get("new_start_at"),
            serializer.validated_data.get("new_end_at"),
        )
        return Response(TaskDetailSerializer(TasksRepository.queryset().get(pk=task.pk)).data)

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        serializer = TaskStatusActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task = cancel_task(
            self.get_object(),
            serializer.validated_data.get("actor_id"),
            serializer.validated_data.get("reason", ""),
        )
        return Response(TaskDetailSerializer(TasksRepository.queryset().get(pk=task.pk)).data)

    @action(detail=True, methods=["get"], url_path="delete-impact")
    def delete_impact(self, request, pk=None):
        return Response(_task_delete_impact(self.get_object()))


class TaskSeriesViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RecurringTaskPlan.objects.select_related("plant").order_by("title", "start_date")
    serializer_class = RecurringTaskPlanSummarySerializer
