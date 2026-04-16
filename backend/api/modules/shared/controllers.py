from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view
from rest_framework.response import Response

from api.modules.plants.models import Farm, PlantStage
from api.modules.plants.serializers import FarmSummarySerializer, PlantStageSummarySerializer
from api.modules.shared.serializers import UserSlimSerializer


User = get_user_model()


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
    users = User.objects.order_by("username")
    workers = users.filter(is_staff=False, is_superuser=False)
    return Response(
        {
            "farms": FarmSummarySerializer(Farm.objects.order_by("name"), many=True).data,
            "plant_stages": PlantStageSummarySerializer(
                PlantStage.objects.order_by("sort_order", "name"),
                many=True,
            ).data,
            "users": UserSlimSerializer(users, many=True).data,
            "workers": UserSlimSerializer(workers, many=True).data,
        }
    )
