from django.db.models import Q
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from api.modules.plants.models import Greenhouse, HarvestHistoryEntry, Plant, Plot
from api.modules.plants.repositories import GreenhousesRepository, PlantsRepository, PlotsRepository
from api.modules.plants.serializers import (
    GreenhouseSummarySerializer,
    GreenhouseWriteSerializer,
    HarvestHistorySerializer,
    HarvestHistoryWriteSerializer,
    PlantDetailSerializer,
    PlantSummarySerializer,
    PlantWriteSerializer,
    PlotSummarySerializer,
    PlotWriteSerializer,
    ResourceUsageSerializer,
    ResourceUsageWriteSerializer,
)
from api.modules.plants.services import (
    build_greenhouse_delete_impact,
    build_plant_delete_impact,
    build_plot_delete_impact,
    change_stage,
    delete_greenhouse,
    delete_plant,
    delete_plot,
    mark_plant_status,
    plants_dashboard,
)
from api.modules.tasks.models import ResourceUsageEntry


class PlantsViewSet(viewsets.ModelViewSet):
    queryset = PlantsRepository.queryset()

    def get_queryset(self):
        queryset = PlantsRepository.queryset()
        params = self.request.query_params

        if status_value := params.get("status"):
            queryset = queryset.filter(status=status_value)
        if stage := params.get("stage"):
            queryset = queryset.filter(stage_id=stage)
        if farm := params.get("farm"):
            queryset = queryset.filter(Q(plot__farm_id=farm) | Q(greenhouse__farm_id=farm))
        if area_type := params.get("area_type"):
            if area_type == "plot":
                queryset = queryset.filter(plot__isnull=False)
            elif area_type == "greenhouse":
                queryset = queryset.filter(greenhouse__isnull=False)
        if plot := params.get("plot"):
            queryset = queryset.filter(plot_id=plot)
        if greenhouse := params.get("greenhouse"):
            queryset = queryset.filter(greenhouse_id=greenhouse)
        if search := params.get("search"):
            queryset = queryset.filter(Q(name__icontains=search) | Q(variety__icontains=search))
        if expected_from := params.get("expected_from"):
            queryset = queryset.filter(expected_harvest_date__gte=expected_from)
        if expected_to := params.get("expected_to"):
            queryset = queryset.filter(expected_harvest_date__lte=expected_to)
        return queryset.distinct()

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return PlantWriteSerializer
        if self.action == "retrieve":
            return PlantDetailSerializer
        return PlantSummarySerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        plant = serializer.save()
        return Response(PlantDetailSerializer(PlantsRepository.queryset().get(pk=plant.pk)).data, status=201)

    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        instance = PlantsRepository.queryset().get(pk=kwargs["pk"])
        return Response(PlantDetailSerializer(instance).data, status=response.status_code)

    @action(detail=False, methods=["get"], url_path="dashboard")
    def dashboard(self, request):
        return Response(plants_dashboard(self.get_queryset()))

    @action(detail=True, methods=["post"], url_path="change-stage")
    def change_stage_action(self, request, pk=None):
        plant = self.get_object()
        serializer = PlantWriteSerializer(plant, data={"stage_id": request.data.get("stage_id")}, partial=True)
        serializer.is_valid(raise_exception=True)
        plant = change_stage(plant, serializer.validated_data["stage"], request.data.get("note", ""))
        return Response(PlantDetailSerializer(PlantsRepository.queryset().get(pk=plant.pk)).data)

    @action(detail=True, methods=["post"], url_path="mark-failed")
    def mark_failed(self, request, pk=None):
        plant = mark_plant_status(self.get_object(), "failed", request.data.get("note", ""))
        return Response(PlantDetailSerializer(PlantsRepository.queryset().get(pk=plant.pk)).data)

    @action(detail=True, methods=["post"], url_path="mark-harvested")
    def mark_harvested(self, request, pk=None):
        plant = mark_plant_status(self.get_object(), "harvested", request.data.get("note", ""))
        return Response(PlantDetailSerializer(PlantsRepository.queryset().get(pk=plant.pk)).data)

    @action(detail=True, methods=["get"], url_path="delete-impact")
    def delete_impact(self, request, pk=None):
        return Response(build_plant_delete_impact(self.get_object()))

    @action(detail=True, methods=["get"], url_path="harvest-history")
    def harvest_history(self, request, pk=None):
        queryset = self.get_object().harvest_history.select_related("recorded_by")
        return Response(HarvestHistorySerializer(queryset, many=True).data)

    @action(detail=True, methods=["get"], url_path="resource-usage")
    def resource_usage(self, request, pk=None):
        queryset = self.get_object().resource_usage.select_related("recorded_by", "task")
        return Response(ResourceUsageSerializer(queryset, many=True).data)

    def destroy(self, request, *args, **kwargs):
        impact = delete_plant(self.get_object())
        return Response({"deleted": impact})


class PlotsViewSet(viewsets.ModelViewSet):
    queryset = PlotsRepository.queryset()

    def get_serializer_class(self):
        return PlotWriteSerializer if self.action in ["create", "update", "partial_update"] else PlotSummarySerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        plot = serializer.save()
        return Response(PlotSummarySerializer(PlotsRepository.queryset().get(pk=plot.pk)).data, status=201)

    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        plot = PlotsRepository.queryset().get(pk=kwargs["pk"])
        return Response(PlotSummarySerializer(plot).data, status=response.status_code)

    @action(detail=True, methods=["get"], url_path="delete-impact")
    def delete_impact(self, request, pk=None):
        return Response(build_plot_delete_impact(self.get_object()))

    def destroy(self, request, *args, **kwargs):
        impact = delete_plot(self.get_object())
        return Response({"deleted": impact})


class GreenhousesViewSet(viewsets.ModelViewSet):
    queryset = GreenhousesRepository.queryset()

    def get_serializer_class(self):
        return GreenhouseWriteSerializer if self.action in ["create", "update", "partial_update"] else GreenhouseSummarySerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        greenhouse = serializer.save()
        return Response(
            GreenhouseSummarySerializer(GreenhousesRepository.queryset().get(pk=greenhouse.pk)).data,
            status=201,
        )

    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        greenhouse = GreenhousesRepository.queryset().get(pk=kwargs["pk"])
        return Response(GreenhouseSummarySerializer(greenhouse).data, status=response.status_code)

    @action(detail=True, methods=["get"], url_path="delete-impact")
    def delete_impact(self, request, pk=None):
        return Response(build_greenhouse_delete_impact(self.get_object()))

    def destroy(self, request, *args, **kwargs):
        impact = delete_greenhouse(self.get_object())
        return Response({"deleted": impact})


class HarvestHistoryViewSet(viewsets.ModelViewSet):
    queryset = HarvestHistoryEntry.objects.select_related("plant", "recorded_by")

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return HarvestHistoryWriteSerializer
        return HarvestHistorySerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        entry = serializer.save()
        return Response(HarvestHistorySerializer(self.queryset.get(pk=entry.pk)).data, status=201)

    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        return Response(HarvestHistorySerializer(self.queryset.get(pk=kwargs["pk"])).data, status=response.status_code)


class ResourceUsageViewSet(viewsets.ModelViewSet):
    queryset = ResourceUsageEntry.objects.select_related("plant", "task", "recorded_by")

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return ResourceUsageWriteSerializer
        return ResourceUsageSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        entry = serializer.save()
        return Response(ResourceUsageSerializer(self.queryset.get(pk=entry.pk)).data, status=201)

    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        return Response(ResourceUsageSerializer(self.queryset.get(pk=kwargs["pk"])).data, status=response.status_code)
