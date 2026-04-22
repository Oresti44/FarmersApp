from rest_framework.decorators import api_view
from rest_framework.response import Response

from api import database
from api.modules.plants.serializers import FarmSummarySerializer, PlantStageSummarySerializer
from api.modules.shared.serializers import UserSlimSerializer


@api_view(["GET"])
def api_root(request):
    return Response(
        {
            "name": "FarmersApp API",
            "status": "ok",
            "endpoints": {
                "health": request.build_absolute_uri("health/"),
                "ui_meta": request.build_absolute_uri("ui-meta/"),
            },
        }
    )


@api_view(["GET"])
def health_check(request):
    return Response({"status": "healthy"})


@api_view(["GET"])
def ui_meta(request):
    users = database.users_queryset()
    return Response(
        {
            "farms": FarmSummarySerializer(database.farms_queryset(), many=True).data,
            "plant_stages": PlantStageSummarySerializer(database.plant_stages_queryset(), many=True).data,
            "users": UserSlimSerializer(users, many=True).data,
            "workers": UserSlimSerializer(database.workers_queryset(), many=True).data,
        }
    )
