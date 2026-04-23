from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from api import database
from api.models import User
from api.modules.finance.serializers import ExpenseCategorySerializer, FinancePartnerSerializer
from api.modules.inventory.serializers import InventoryCategorySerializer
from api.modules.plants.serializers import FarmSummarySerializer, PlantStageSummarySerializer
from api.modules.plants.models import Farm
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


@api_view(["POST"])
def login(request):
    email = str(request.data.get("email", "")).strip().lower()
    password = request.data.get("password", "")
    user = User.objects.filter(email__iexact=email, is_active=True).first()

    if not user or not user.check_password(password):
        return Response({"detail": "Invalid email or password."}, status=status.HTTP_400_BAD_REQUEST)

    farms = database.farms_queryset()
    return Response(
        {
            "user": UserSlimSerializer(user).data,
            "farms": FarmSummarySerializer(farms, many=True).data,
        }
    )


@api_view(["POST"])
def signup(request):
    email = str(request.data.get("email", "")).strip().lower()
    full_name = str(request.data.get("full_name", "")).strip()
    password = request.data.get("password", "")
    role = request.data.get("role", "manager")
    farm_name = str(request.data.get("farm_name", "")).strip()

    if role not in ["manager", "worker"]:
        return Response({"detail": "Role must be manager or worker."}, status=status.HTTP_400_BAD_REQUEST)
    if not email or not full_name or not password:
        return Response({"detail": "Full name, email, and password are required."}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(email__iexact=email).exists():
        return Response({"detail": "A user with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(email=email, full_name=full_name, password=password, role=role)
    farm = None
    if role == "manager":
        farm = Farm.objects.create(
            name=farm_name or f"{full_name}'s Farm",
            description="Created during manager signup.",
            manager=user,
        )

    farms = [farm] if farm else list(database.farms_queryset())
    return Response(
        {
            "user": UserSlimSerializer(user).data,
            "farms": FarmSummarySerializer(farms, many=True).data,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
def ui_meta(request):
    users = database.users_queryset()
    return Response(
        {
            "farms": FarmSummarySerializer(database.farms_queryset(), many=True).data,
            "expense_categories": ExpenseCategorySerializer(database.expense_categories_queryset(), many=True).data,
            "finance_partners": FinancePartnerSerializer(database.finance_partners_queryset(), many=True).data,
            "inventory_categories": InventoryCategorySerializer(database.inventory_categories_queryset(), many=True).data,
            "plant_stages": PlantStageSummarySerializer(database.plant_stages_queryset(), many=True).data,
            "users": UserSlimSerializer(users, many=True).data,
            "workers": UserSlimSerializer(database.workers_queryset(), many=True).data,
        }
    )
