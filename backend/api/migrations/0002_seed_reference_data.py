from django.db import migrations


def seed_reference_data(apps, schema_editor):
    Farm = apps.get_model("api", "Farm")
    PlantStage = apps.get_model("api", "PlantStage")

    if not Farm.objects.exists():
        Farm.objects.create(
            name="Main Farm",
            description="Default farm created for initial setup.",
            location_text="Primary site",
        )

    stages = [
        ("Planning", 10, "Planting plan is prepared."),
        ("Seedling", 20, "Young plants are establishing."),
        ("Vegetative", 30, "Leaf and stem growth is active."),
        ("Flowering", 40, "Flowering has started."),
        ("Fruiting", 50, "Fruit development is underway."),
        ("Harvest", 60, "Harvest window is open."),
    ]

    for name, sort_order, description in stages:
        PlantStage.objects.get_or_create(
            name=name,
            defaults={"sort_order": sort_order, "description": description},
        )


def unseed_reference_data(apps, schema_editor):
    Farm = apps.get_model("api", "Farm")
    PlantStage = apps.get_model("api", "PlantStage")

    Farm.objects.filter(name="Main Farm", description="Default farm created for initial setup.").delete()
    PlantStage.objects.filter(
        name__in=["Planning", "Seedling", "Vegetative", "Flowering", "Fruiting", "Harvest"]
    ).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_reference_data, reverse_code=unseed_reference_data),
    ]
