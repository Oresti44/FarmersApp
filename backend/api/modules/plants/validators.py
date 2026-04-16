from rest_framework import serializers

from api.modules.plants.models import Plant


def validate_plant_payload(data, instance=None):
    plot = data.get("plot", getattr(instance, "plot", None))
    greenhouse = data.get("greenhouse", getattr(instance, "greenhouse", None))
    stage = data.get("stage", getattr(instance, "stage", None))

    if not stage:
        raise serializers.ValidationError({"stage_id": "Stage is required."})

    if bool(plot) == bool(greenhouse):
        raise serializers.ValidationError(
            {"area_type": "A plant must belong to exactly one area: a plot or a greenhouse."}
        )

    if plot:
        occupant = Plant.objects.filter(plot=plot)
        if instance:
            occupant = occupant.exclude(pk=instance.pk)
        if occupant.exists():
            raise serializers.ValidationError({"plot_id": "This plot already has a plant assigned."})


def validate_expected_range(start_date, end_date):
    if start_date and end_date and end_date < start_date:
        raise serializers.ValidationError(
            {"expected_harvest_date": "Expected harvest date cannot be before planted date."}
        )
