from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from api import database
from api.modules.plants.models import Greenhouse, HarvestHistoryEntry, Plant, Plot
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
from api.modules.tasks.models import ResourceUsageEntry


class PlantsViewSet(viewsets.ModelViewSet):
    queryset = Plant.objects.none()

    def get_queryset(self):
        return database.filter_plants(database.plants_queryset(), self.request.query_params)

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return PlantWriteSerializer
        if self.action == "retrieve":
            return PlantDetailSerializer
        return PlantSummarySerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        plant = database.save_serializer(serializer)
        return Response(PlantDetailSerializer(database.get_plant(plant.pk)).data, status=201)

    def perform_update(self, serializer):
        database.save_serializer(serializer)

    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        instance = database.get_plant(kwargs["pk"])
        return Response(PlantDetailSerializer(instance).data, status=response.status_code)

    @action(detail=False, methods=["get"], url_path="dashboard")
    def dashboard(self, request):
        return Response(database.plants_dashboard(self.get_queryset()))

    @action(detail=True, methods=["post"], url_path="change-stage")
    def change_stage_action(self, request, pk=None):
        plant = self.get_object()
        serializer = PlantWriteSerializer(plant, data={"stage_id": request.data.get("stage_id")}, partial=True)
        serializer.is_valid(raise_exception=True)
        plant = database.change_stage(plant, serializer.validated_data["stage"], request.data.get("note", ""))
        return Response(PlantDetailSerializer(database.get_plant(plant.pk)).data)

    @action(detail=True, methods=["post"], url_path="mark-failed")
    def mark_failed(self, request, pk=None):
        plant = database.mark_plant_status(self.get_object(), "failed", request.data.get("note", ""))
        return Response(PlantDetailSerializer(database.get_plant(plant.pk)).data)

    @action(detail=True, methods=["post"], url_path="mark-harvested")
    def mark_harvested(self, request, pk=None):
        plant = database.mark_plant_status(self.get_object(), "harvested", request.data.get("note", ""))
        return Response(PlantDetailSerializer(database.get_plant(plant.pk)).data)

    @action(detail=True, methods=["get"], url_path="delete-impact")
    def delete_impact(self, request, pk=None):
        return Response(database.build_plant_delete_impact(self.get_object()))

    @action(detail=True, methods=["get"], url_path="harvest-history")
    def harvest_history(self, request, pk=None):
        queryset = database.plant_harvest_history(self.get_object())
        return Response(HarvestHistorySerializer(queryset, many=True).data)

    @action(detail=True, methods=["get"], url_path="resource-usage")
    def resource_usage(self, request, pk=None):
        queryset = database.plant_resource_usage(self.get_object())
        return Response(ResourceUsageSerializer(queryset, many=True).data)

    def destroy(self, request, *args, **kwargs):
        impact = database.delete_plant(self.get_object())
        return Response({"deleted": impact})


class PlotsViewSet(viewsets.ModelViewSet):
    queryset = Plot.objects.none()

    def get_queryset(self):
        return database.plots_queryset()

    def get_serializer_class(self):
        return PlotWriteSerializer if self.action in ["create", "update", "partial_update"] else PlotSummarySerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        plot = database.save_serializer(serializer)
        return Response(PlotSummarySerializer(database.get_plot(plot.pk)).data, status=201)

    def perform_update(self, serializer):
        database.save_serializer(serializer)

    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        plot = database.get_plot(kwargs["pk"])
        return Response(PlotSummarySerializer(plot).data, status=response.status_code)

    @action(detail=True, methods=["get"], url_path="delete-impact")
    def delete_impact(self, request, pk=None):
        return Response(database.build_plot_delete_impact(self.get_object()))

    def destroy(self, request, *args, **kwargs):
        impact = database.delete_plot(self.get_object())
        return Response({"deleted": impact})


class GreenhousesViewSet(viewsets.ModelViewSet):
    queryset = Greenhouse.objects.none()

    def get_queryset(self):
        return database.greenhouses_queryset()

    def get_serializer_class(self):
        return GreenhouseWriteSerializer if self.action in ["create", "update", "partial_update"] else GreenhouseSummarySerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        greenhouse = database.save_serializer(serializer)
        return Response(
            GreenhouseSummarySerializer(database.get_greenhouse(greenhouse.pk)).data,
            status=201,
        )

    def perform_update(self, serializer):
        database.save_serializer(serializer)

    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        greenhouse = database.get_greenhouse(kwargs["pk"])
        return Response(GreenhouseSummarySerializer(greenhouse).data, status=response.status_code)

    @action(detail=True, methods=["get"], url_path="delete-impact")
    def delete_impact(self, request, pk=None):
        return Response(database.build_greenhouse_delete_impact(self.get_object()))

    def destroy(self, request, *args, **kwargs):
        impact = database.delete_greenhouse(self.get_object())
        return Response({"deleted": impact})


class HarvestHistoryViewSet(viewsets.ModelViewSet):
    queryset = HarvestHistoryEntry.objects.none()

    def get_queryset(self):
        return database.harvest_history_queryset()

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return HarvestHistoryWriteSerializer
        return HarvestHistorySerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        entry = database.save_serializer(serializer)
        return Response(HarvestHistorySerializer(database.get_harvest_history_entry(entry.pk)).data, status=201)

    def perform_update(self, serializer):
        database.save_serializer(serializer)

    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        return Response(HarvestHistorySerializer(database.get_harvest_history_entry(kwargs["pk"])).data, status=response.status_code)


class ResourceUsageViewSet(viewsets.ModelViewSet):
    queryset = ResourceUsageEntry.objects.none()

    def get_queryset(self):
        return database.resource_usage_queryset()

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return ResourceUsageWriteSerializer
        return ResourceUsageSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        entry = database.save_serializer(serializer)
        return Response(ResourceUsageSerializer(database.get_resource_usage_entry(entry.pk)).data, status=201)

    def perform_update(self, serializer):
        database.save_serializer(serializer)

    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        return Response(ResourceUsageSerializer(database.get_resource_usage_entry(kwargs["pk"])).data, status=response.status_code)
