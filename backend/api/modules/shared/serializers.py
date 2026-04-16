from django.contrib.auth import get_user_model
from rest_framework import serializers


User = get_user_model()


class UserSlimSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "full_name", "email", "role"]

    def get_full_name(self, obj):
        full_name = obj.get_full_name().strip()
        return full_name or obj.username

    def get_role(self, obj):
        return "manager" if obj.is_staff or obj.is_superuser else "worker"
