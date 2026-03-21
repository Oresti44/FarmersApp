from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def api_root(request):
    return Response(
        {
            "name": "FarmersApp API",
            "status": "ok",
            "endpoints": {
                "health": request.build_absolute_uri("health/"),
            },
        }
    )


@api_view(["GET"])
def health_check(request):
    return Response({"status": "healthy"})
