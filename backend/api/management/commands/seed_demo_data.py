from datetime import datetime, time, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import connection, transaction
from django.utils import timezone

from api.modules.plants.models import Farm, Greenhouse, HarvestHistoryEntry, Plant, PlantStage, Plot
from api.modules.tasks.models import (
    RecurringTaskPlan,
    ResourceUsageEntry,
    Task,
    TaskAssignmentRecord,
    TaskCommentRecord,
    TaskHistoryEntry,
)


User = get_user_model()


DEMO_FARM_NAME = "Demo Valley Farm"
DEMO_MANAGER = {
    "username": "demo_manager",
    "email": "manager@demo.farm",
    "first_name": "Mira",
    "last_name": "Kola",
    "password": "Demo12345!",
}
DEMO_WORKERS = [
    ("demo_worker_01", "Arben", "Lika"),
    ("demo_worker_02", "Sara", "Deda"),
    ("demo_worker_03", "Blerim", "Hoxha"),
    ("demo_worker_04", "Elira", "Tafa"),
    ("demo_worker_05", "Jon", "Pepa"),
    ("demo_worker_06", "Drita", "Muca"),
    ("demo_worker_07", "Kledi", "Vata"),
    ("demo_worker_08", "Anisa", "Marku"),
]
STAGE_DEFINITIONS = [
    ("Planning", 10, "Planting plan is prepared."),
    ("Seedling", 20, "Young plants are establishing."),
    ("Vegetative", 30, "Leaf and stem growth is active."),
    ("Flowering", 40, "Flowering has started."),
    ("Fruiting", 50, "Fruit development is underway."),
    ("Harvest", 60, "Harvest window is open."),
]
PLOT_SPECS = [
    {
        "name": "North Plot 1",
        "code": "NP-01",
        "size_value": Decimal("480.00"),
        "soil_type": "Loam",
        "irrigation_type": "Drip",
        "notes": "High sun exposure, best for tomatoes.",
        "plant": {
            "name": "Roma Tomato",
            "variety": "Roma VF",
            "stage": "Fruiting",
            "status": "active",
            "quantity": Decimal("320.00"),
            "quantity_unit": "plants",
            "planted_days_ago": 86,
            "expected_harvest_in_days": 12,
            "notes": "Fruit load is heavy and needs support checks.",
        },
    },
    {
        "name": "North Plot 2",
        "code": "NP-02",
        "size_value": Decimal("360.00"),
        "soil_type": "Sandy loam",
        "irrigation_type": "Sprinkler",
        "notes": "Fast-draining block for leafy greens.",
        "plant": {
            "name": "Butterhead Lettuce",
            "variety": "May Queen",
            "stage": "Harvest",
            "status": "active",
            "quantity": Decimal("780.00"),
            "quantity_unit": "heads",
            "planted_days_ago": 41,
            "expected_harvest_in_days": 3,
            "notes": "Ready for staggered harvest through the week.",
        },
    },
    {
        "name": "East Plot 1",
        "code": "EP-01",
        "size_value": Decimal("640.00"),
        "soil_type": "Clay loam",
        "irrigation_type": "Drip",
        "notes": "Protected from strong western winds.",
        "plant": {
            "name": "Sweet Corn",
            "variety": "Golden Jubilee",
            "stage": "Vegetative",
            "status": "active",
            "quantity": Decimal("540.00"),
            "quantity_unit": "plants",
            "planted_days_ago": 52,
            "expected_harvest_in_days": 34,
            "notes": "Needs side dressing before tasseling starts.",
        },
    },
    {
        "name": "East Plot 2",
        "code": "EP-02",
        "size_value": Decimal("510.00"),
        "soil_type": "Loam",
        "irrigation_type": "Drip",
        "notes": "Mulched heavily to suppress weeds.",
        "plant": {
            "name": "Bell Pepper",
            "variety": "California Wonder",
            "stage": "Flowering",
            "status": "active",
            "quantity": Decimal("270.00"),
            "quantity_unit": "plants",
            "planted_days_ago": 68,
            "expected_harvest_in_days": 20,
            "notes": "Pollination has started, monitor calcium uptake.",
        },
    },
    {
        "name": "South Plot 1",
        "code": "SP-01",
        "size_value": Decimal("420.00"),
        "soil_type": "Silt loam",
        "irrigation_type": "Furrow",
        "notes": "Good moisture retention for root crops.",
        "plant": {
            "name": "Red Onion",
            "variety": "Red Baron",
            "stage": "Seedling",
            "status": "active",
            "quantity": Decimal("920.00"),
            "quantity_unit": "plants",
            "planted_days_ago": 18,
            "expected_harvest_in_days": 72,
            "notes": "Stand establishment still uneven on the lower strip.",
        },
    },
    {
        "name": "South Plot 2",
        "code": "SP-02",
        "size_value": Decimal("570.00"),
        "soil_type": "Loam",
        "irrigation_type": "Drip",
        "notes": "Berry block with raised beds.",
        "plant": {
            "name": "Strawberry",
            "variety": "Albion",
            "stage": "Harvest",
            "status": "harvested",
            "quantity": Decimal("410.00"),
            "quantity_unit": "plants",
            "planted_days_ago": 132,
            "expected_harvest_in_days": -9,
            "notes": "Primary harvest cycle finished, beds ready for cleanup.",
        },
    },
    {
        "name": "West Plot 1",
        "code": "WP-01",
        "size_value": Decimal("460.00"),
        "soil_type": "Sandy loam",
        "irrigation_type": "Drip",
        "notes": "Open block near equipment shed.",
        "plant": {
            "name": "Zucchini",
            "variety": "Black Beauty",
            "stage": "Vegetative",
            "status": "active",
            "quantity": Decimal("190.00"),
            "quantity_unit": "plants",
            "planted_days_ago": 36,
            "expected_harvest_in_days": 18,
            "notes": "Canopy closing fast; mildew checks are important.",
        },
    },
    {
        "name": "West Plot 2",
        "code": "WP-02",
        "size_value": Decimal("495.00"),
        "soil_type": "Clay loam",
        "irrigation_type": "Drip",
        "notes": "Cooler patch used for potatoes.",
        "plant": {
            "name": "Potato",
            "variety": "Kennebec",
            "stage": "Flowering",
            "status": "active",
            "quantity": Decimal("610.00"),
            "quantity_unit": "plants",
            "planted_days_ago": 71,
            "expected_harvest_in_days": 26,
            "notes": "Ridging done recently; keep irrigation stable.",
        },
    },
]
GREENHOUSE_SPECS = [
    {
        "name": "Propagation House",
        "code": "GH-01",
        "size_value": Decimal("210.00"),
        "greenhouse_type": "Propagation tunnel",
        "temperature_min_c": Decimal("18.00"),
        "temperature_max_c": Decimal("24.00"),
        "humidity_target_percent": Decimal("72.00"),
        "notes": "For trays, plugs, and young starts.",
    },
    {
        "name": "Leafy House",
        "code": "GH-02",
        "size_value": Decimal("285.00"),
        "greenhouse_type": "Hydroponic greenhouse",
        "temperature_min_c": Decimal("17.00"),
        "temperature_max_c": Decimal("23.00"),
        "humidity_target_percent": Decimal("68.00"),
        "notes": "Steady output of greens and herbs.",
    },
    {
        "name": "Tomato House",
        "code": "GH-03",
        "size_value": Decimal("340.00"),
        "greenhouse_type": "High tunnel",
        "temperature_min_c": Decimal("19.00"),
        "temperature_max_c": Decimal("28.00"),
        "humidity_target_percent": Decimal("65.00"),
        "notes": "Main greenhouse for fruiting crops.",
    },
    {
        "name": "Mixed Crop House",
        "code": "GH-04",
        "size_value": Decimal("300.00"),
        "greenhouse_type": "Poly greenhouse",
        "temperature_min_c": Decimal("18.00"),
        "temperature_max_c": Decimal("26.00"),
        "humidity_target_percent": Decimal("67.00"),
        "notes": "Used for peppers, cucumbers, and experimental blocks.",
    },
]
GREENHOUSE_PLANT_SPECS = [
    ("GH-01", "Cherry Tomato", "Sakura", "Seedling", "active", Decimal("220.00"), "plants", 14, 62, "Seedlings ready for potting-on."),
    ("GH-01", "Beefsteak Tomato", "Marmande", "Planning", "active", Decimal("160.00"), "plants", 4, 88, "Trays allocated, transplant plan pending."),
    ("GH-01", "Cucumber", "Picolino", "Seedling", "active", Decimal("180.00"), "plants", 11, 48, "Uniform emergence, irrigation should stay light."),
    ("GH-01", "Bell Pepper", "Yellow Star", "Seedling", "active", Decimal("210.00"), "plants", 16, 76, "Needs hardening next week."),
    ("GH-01", "Basil", "Genovese", "Vegetative", "active", Decimal("260.00"), "plants", 24, 20, "Dense growth, first cut approaching."),
    ("GH-01", "Eggplant", "Nadia", "Seedling", "active", Decimal("150.00"), "plants", 13, 70, "Some trays are cooler near the north wall."),
    ("GH-02", "Romaine Lettuce", "Green Towers", "Harvest", "active", Decimal("540.00"), "heads", 34, 2, "Daily harvest window is open."),
    ("GH-02", "Spinach", "Corvair", "Vegetative", "active", Decimal("600.00"), "plants", 21, 16, "Leaf mass improving after feed correction."),
    ("GH-02", "Arugula", "Astro", "Harvest", "harvested", Decimal("480.00"), "bunches", 29, -5, "Recent cycle completed and logged."),
    ("GH-02", "Parsley", "Giant of Italy", "Vegetative", "active", Decimal("300.00"), "plants", 27, 26, "Needs pruning to improve airflow."),
    ("GH-02", "Mint", "Spearmint", "Harvest", "active", Decimal("240.00"), "plants", 38, 4, "Multiple cuttings scheduled this week."),
    ("GH-02", "Cilantro", "Leisure", "Seedling", "active", Decimal("350.00"), "plants", 12, 28, "Germination patchy in one channel."),
    ("GH-03", "Tomato Cluster", "Trust", "Flowering", "active", Decimal("210.00"), "plants", 48, 24, "Cluster set is good, monitor EC closely."),
    ("GH-03", "Tomato Cluster", "Merlice", "Fruiting", "active", Decimal("225.00"), "plants", 79, 9, "Fruit sizing is ahead of plan."),
    ("GH-03", "Tomato Cluster", "Cappricia", "Harvest", "active", Decimal("200.00"), "plants", 98, 1, "Peak picking period."),
    ("GH-03", "Tomato Cherry", "Sunstream", "Fruiting", "active", Decimal("260.00"), "plants", 75, 7, "Requires frequent pruning and harvest."),
    ("GH-03", "Tomato Plum", "Granadero", "Harvest", "harvested", Decimal("190.00"), "plants", 112, -12, "Main harvest ended and crop is being cleared."),
    ("GH-03", "Cucumber", "Bonbon", "Flowering", "active", Decimal("175.00"), "plants", 42, 18, "Pollination support and feed adjustments needed."),
    ("GH-04", "Pepper", "Kapia", "Fruiting", "active", Decimal("240.00"), "plants", 73, 10, "Fruit color break started."),
    ("GH-04", "Pepper", "Bell Red Knight", "Harvest", "active", Decimal("210.00"), "plants", 88, 3, "Harvest crew should rotate rows daily."),
    ("GH-04", "Cucumber", "Kalunga", "Vegetative", "active", Decimal("185.00"), "plants", 31, 23, "Training lines need retensioning."),
    ("GH-04", "Basil", "Lemon", "Harvest", "harvested", Decimal("170.00"), "plants", 54, -7, "Old cycle closed after final cut."),
    ("GH-04", "Pepper", "Hungarian Wax", "Flowering", "active", Decimal("195.00"), "plants", 58, 19, "Set looks uneven near exhaust fans."),
    ("GH-04", "Eggplant", "Classic", "Fruiting", "active", Decimal("160.00"), "plants", 67, 14, "Requires scouting for mites twice weekly."),
]


class Command(BaseCommand):
    help = "Populate the database with a large, realistic demo dataset for testing."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete previous demo farm data and demo users before reseeding.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["reset"]:
            self._reset_demo_data()

        stage_map = self._ensure_stages()
        manager, workers = self._create_users()
        farm = self._create_farm(manager)
        plots = self._create_plots(farm)
        greenhouses = self._create_greenhouses(farm)
        plants = self._create_plants(stage_map, plots, greenhouses)
        recurring_plans = self._create_recurring_plans(plants, manager)
        stats = self._create_task_ecosystem(plants, recurring_plans, manager, workers)

        self.stdout.write(self.style.SUCCESS("Demo data seeded successfully."))
        self.stdout.write(f"Farm: {farm.name}")
        self.stdout.write(f"Manager login: {DEMO_MANAGER['username']} / {DEMO_MANAGER['password']}")
        self.stdout.write("Worker password for all demo workers: Demo12345!")
        self.stdout.write(
            "Created "
            f"{len(plots)} plots, {len(greenhouses)} greenhouses, {len(plants)} plants, "
            f"{len(recurring_plans)} recurring plans, {stats['tasks']} tasks, "
            f"{stats['assignments']} assignments, {stats['comments']} comments, "
            f"{stats['history']} history entries, {stats['resource_usage']} resource logs, "
            f"and {stats['harvests']} harvest records."
        )

    def _reset_demo_data(self):
        Farm.objects.filter(name=DEMO_FARM_NAME).delete()
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM users WHERE email LIKE %s", ["%@demo.farm"])
        User.objects.filter(username__startswith="demo_").delete()

    def _ensure_stages(self):
        stages = {}
        for name, sort_order, description in STAGE_DEFINITIONS:
            stage, _ = PlantStage.objects.get_or_create(
                name=name,
                defaults={"sort_order": sort_order, "description": description},
            )
            stages[name] = stage
        return stages

    def _create_users(self):
        manager, _ = User.objects.update_or_create(
            username=DEMO_MANAGER["username"],
            defaults={
                "email": DEMO_MANAGER["email"],
                "first_name": DEMO_MANAGER["first_name"],
                "last_name": DEMO_MANAGER["last_name"],
                "is_staff": True,
                "is_superuser": False,
                "is_active": True,
            },
        )
        manager.set_password(DEMO_MANAGER["password"])
        manager.save()
        self._sync_raw_user(manager, role="manager")

        workers = []
        for username, first_name, last_name in DEMO_WORKERS:
            worker, _ = User.objects.update_or_create(
                username=username,
                defaults={
                    "email": f"{username}@demo.farm",
                    "first_name": first_name,
                    "last_name": last_name,
                    "is_staff": False,
                    "is_superuser": False,
                    "is_active": True,
                },
            )
            worker.set_password("Demo12345!")
            worker.save()
            self._sync_raw_user(worker, role="worker")
            workers.append(worker)
        return manager, workers

    def _create_farm(self, manager):
        farm, _ = Farm.objects.update_or_create(
            name=DEMO_FARM_NAME,
            defaults={
                "description": "Large demo farm seeded for UI and workflow testing.",
                "location_text": "Lushnje, Albania",
                "manager": manager,
            },
        )
        return farm

    def _create_plots(self, farm):
        plots = []
        for spec in PLOT_SPECS:
            plots.append(
                Plot.objects.create(
                    farm=farm,
                    name=spec["name"],
                    code=spec["code"],
                    size_value=spec["size_value"],
                    size_unit="m2",
                    soil_type=spec["soil_type"],
                    irrigation_type=spec["irrigation_type"],
                    status="active",
                    notes=spec["notes"],
                )
            )
        return plots

    def _create_greenhouses(self, farm):
        greenhouses = []
        for spec in GREENHOUSE_SPECS:
            greenhouses.append(
                Greenhouse.objects.create(
                    farm=farm,
                    name=spec["name"],
                    code=spec["code"],
                    size_value=spec["size_value"],
                    size_unit="m2",
                    greenhouse_type=spec["greenhouse_type"],
                    temperature_min_c=spec["temperature_min_c"],
                    temperature_max_c=spec["temperature_max_c"],
                    humidity_target_percent=spec["humidity_target_percent"],
                    status="active",
                    notes=spec["notes"],
                )
            )
        return greenhouses

    def _create_plants(self, stage_map, plots, greenhouses):
        today = timezone.localdate()
        plants = []
        greenhouse_by_code = {greenhouse.code: greenhouse for greenhouse in greenhouses}

        for plot, spec in zip(plots, PLOT_SPECS):
            plant_spec = spec["plant"]
            plants.append(
                Plant.objects.create(
                    plot=plot,
                    greenhouse=None,
                    stage=stage_map[plant_spec["stage"]],
                    name=plant_spec["name"],
                    variety=plant_spec["variety"],
                    quantity=plant_spec["quantity"],
                    quantity_unit=plant_spec["quantity_unit"],
                    planted_date=today - timedelta(days=plant_spec["planted_days_ago"]),
                    expected_harvest_date=today + timedelta(days=plant_spec["expected_harvest_in_days"]),
                    status=plant_spec["status"],
                    notes=plant_spec["notes"],
                )
            )

        for (
            greenhouse_code,
            name,
            variety,
            stage_name,
            status,
            quantity,
            quantity_unit,
            planted_days_ago,
            expected_harvest_in_days,
            notes,
        ) in GREENHOUSE_PLANT_SPECS:
            plants.append(
                Plant.objects.create(
                    plot=None,
                    greenhouse=greenhouse_by_code[greenhouse_code],
                    stage=stage_map[stage_name],
                    name=name,
                    variety=variety,
                    quantity=quantity,
                    quantity_unit=quantity_unit,
                    planted_date=today - timedelta(days=planted_days_ago),
                    expected_harvest_date=today + timedelta(days=expected_harvest_in_days),
                    status=status,
                    notes=notes,
                )
            )

        return plants

    def _create_recurring_plans(self, plants, manager):
        active_plants = [plant for plant in plants if plant.status == "active"]
        plans = []
        start_date = timezone.localdate() - timedelta(days=14)
        frequencies = ["daily", "weekly", "weekly", "monthly"]
        times = [time(6, 30), time(7, 15), time(9, 0), time(14, 30)]

        for index, plant in enumerate(active_plants[:10]):
            stage_name = plant.stage.name.lower()
            if stage_name in {"seedling", "planning"}:
                title = f"Seedling care cycle - {plant.name} {plant.variety}"
                category = "inspection"
                required_items = "misting wand, tray labels, EC meter"
            elif stage_name in {"vegetative", "flowering"}:
                title = f"Nutrient and pruning cycle - {plant.name} {plant.variety}"
                category = "fertilizing"
                required_items = "liquid feed, pruning snips, PPE"
            else:
                title = f"Harvest prep cycle - {plant.name} {plant.variety}"
                category = "harvesting"
                required_items = "harvest crates, knives, sanitation wipes"

            plan = RecurringTaskPlan.objects.create(
                plant=plant,
                title=title,
                description=f"Recurring maintenance plan for {plant.name} {plant.variety}.",
                category=category,
                priority="medium" if index % 3 else "high",
                frequency=frequencies[index % len(frequencies)],
                interval_value=1 if index % 4 else 2,
                weekdays_text="mon,wed,fri" if index % 2 == 0 else "",
                start_date=start_date,
                end_date=start_date + timedelta(days=90),
                time_of_day=times[index % len(times)],
                default_duration_minutes=45 + (index % 3) * 15,
                required_items_text=required_items,
                is_active=True,
                created_by=manager,
                last_updated_by=manager,
            )
            plans.append(plan)

        return plans

    def _create_task_ecosystem(self, plants, recurring_plans, manager, workers):
        plan_by_plant_id = {plan.plant_id: plan for plan in recurring_plans}
        stats = {
            "tasks": 0,
            "assignments": 0,
            "comments": 0,
            "history": 0,
            "resource_usage": 0,
            "harvests": 0,
        }
        now = timezone.now()

        for index, plant in enumerate(plants):
            assigned_workers = [workers[index % len(workers)], workers[(index + 3) % len(workers)]]
            task_specs = self._build_task_specs(plant, index, now, plan_by_plant_id.get(plant.id))

            for task_index, spec in enumerate(task_specs):
                task = Task.objects.create(
                    recurring_series=spec["recurring_series"],
                    plant=plant,
                    title=spec["title"],
                    description=spec["description"],
                    category=spec["category"],
                    priority=spec["priority"],
                    status=spec["status"],
                    scheduled_start_at=spec["scheduled_start_at"],
                    scheduled_end_at=spec["scheduled_end_at"],
                    actual_start_at=spec["actual_start_at"],
                    worker_completed_at=spec["worker_completed_at"],
                    manager_confirmed_at=spec["manager_confirmed_at"],
                    required_items_text=spec["required_items_text"],
                    worker_note=spec["worker_note"],
                    manager_note=spec["manager_note"],
                    postponement_reason=spec["postponement_reason"],
                    cancellation_reason=spec["cancellation_reason"],
                    completion_confirmation_note=spec["completion_confirmation_note"],
                    created_by=manager,
                    last_updated_by=manager,
                )
                self._set_auto_timestamp(task, spec["created_at"], spec["updated_at"])
                stats["tasks"] += 1

                selected_workers = assigned_workers[: spec["worker_count"]]
                for assignment_index, worker in enumerate(selected_workers):
                    assignment = TaskAssignmentRecord.objects.create(
                        task=task,
                        worker=worker,
                        assigned_by=manager,
                    )
                    assignment_time = spec["created_at"] + timedelta(hours=assignment_index + 1)
                    self._set_assignment_timestamp(assignment, assignment_time)
                    stats["assignments"] += 1

                history_specs = self._build_history_specs(task, spec, selected_workers)
                for history_time, action_type, field_name, old_value, new_value, note in history_specs:
                    history_entry = TaskHistoryEntry.objects.create(
                        task=task,
                        actor=manager if action_type != "worker_progress" else selected_workers[0],
                        action_type=action_type,
                        field_name=field_name,
                        old_value=old_value,
                        new_value=new_value,
                        action_note=note,
                    )
                    self._set_created_timestamp(history_entry, history_time)
                    stats["history"] += 1

                comment_specs = self._build_comment_specs(task, spec, manager, selected_workers, task_index)
                for comment_time, author, comment_type, message in comment_specs:
                    comment = TaskCommentRecord.objects.create(
                        task=task,
                        author=author,
                        comment_type=comment_type,
                        message=message,
                    )
                    self._set_created_timestamp(comment, comment_time)
                    stats["comments"] += 1

                if spec["status"] in {"completed", "completed_pending_confirmation", "in_progress"}:
                    resource_specs = self._build_resource_specs(task, plant)
                    for resource_name, resource_type, quantity, quantity_unit, notes, used_at in resource_specs:
                        resource = ResourceUsageEntry.objects.create(
                            plant=plant,
                            task=task,
                            resource_name=resource_name,
                            resource_type=resource_type,
                            quantity=quantity,
                            quantity_unit=quantity_unit,
                            used_at=used_at,
                            notes=notes,
                            recorded_by=manager,
                        )
                        self._set_created_timestamp(resource, used_at + timedelta(minutes=20))
                        stats["resource_usage"] += 1

            if plant.status == "harvested" or plant.stage.name == "Harvest":
                harvest_specs = self._build_harvest_specs(plant, index)
                for harvested_at, quantity, quantity_unit, quality_grade, notes in harvest_specs:
                    harvest = HarvestHistoryEntry.objects.create(
                        plant=plant,
                        harvested_at=harvested_at,
                        quantity=quantity,
                        quantity_unit=quantity_unit,
                        quality_grade=quality_grade,
                        notes=notes,
                        recorded_by=manager,
                    )
                    self._set_created_timestamp(harvest, harvested_at + timedelta(minutes=30))
                    stats["harvests"] += 1

        return stats

    def _build_task_specs(self, plant, index, now, recurring_plan):
        stage_name = plant.stage.name.lower()
        base_start = now - timedelta(days=16 - (index % 7), hours=2 * (index % 4))
        future_start = now + timedelta(days=1 + (index % 5), hours=(index % 3) * 2)
        priority = "high" if stage_name in {"flowering", "fruiting", "harvest"} else "medium"

        if plant.status == "harvested":
            return [
                self._task_spec(
                    title=f"Final harvest and weigh-in - {plant.name} {plant.variety}",
                    description=f"Complete the final harvest batch for {plant.name} {plant.variety} and log yield.",
                    category="harvesting",
                    priority="high",
                    status="completed",
                    start_at=base_start,
                    duration_minutes=110,
                    required_items="harvest crates, field scale, pallet tags",
                    worker_note="Final crates moved to cold room and yield reconciled.",
                    manager_note="Harvest closed successfully and lot marked complete.",
                    completion_note="Manager validated the final harvested volume.",
                    created_at=base_start - timedelta(days=1),
                ),
                self._task_spec(
                    title=f"Post-harvest cleanup - {plant.name} {plant.variety}",
                    description=f"Remove spent crop residue and sanitize the area used for {plant.name}.",
                    category="cleaning",
                    priority="medium",
                    status="completed",
                    start_at=base_start + timedelta(days=2),
                    duration_minutes=90,
                    required_items="sanitation foam, bins, disposal bags",
                    worker_note="Crop waste removed and surfaces washed.",
                    manager_note="Block is ready for the next rotation.",
                    completion_note="Cleanup photos reviewed and accepted.",
                    created_at=base_start + timedelta(days=1),
                ),
                self._task_spec(
                    title=f"Soil reset plan - {plant.name} {plant.variety}",
                    description=f"Prepare the area for the next cycle after harvesting {plant.name}.",
                    category="maintenance",
                    priority="medium",
                    status="scheduled",
                    start_at=future_start + timedelta(days=3),
                    duration_minutes=75,
                    required_items="compost, tools, row markers",
                    manager_note="Queue this once labor frees up after market deliveries.",
                    created_at=now - timedelta(hours=10),
                    worker_count=1,
                    recurring_series=recurring_plan,
                ),
            ]

        if stage_name in {"planning", "seedling"}:
            return [
                self._task_spec(
                    title=f"Tray setup and irrigation check - {plant.name} {plant.variety}",
                    description=f"Prepare trays and confirm moisture schedule for {plant.name} starts.",
                    category="irrigation",
                    priority="medium",
                    status="completed",
                    start_at=base_start,
                    duration_minutes=55,
                    required_items="misting wand, labels, starter mix",
                    worker_note="Trays were leveled and moisture is stable.",
                    manager_note="Good start, keep daily monitoring in place.",
                    completion_note="Reviewed after morning rounds.",
                    created_at=base_start - timedelta(days=2),
                    recurring_series=recurring_plan,
                ),
                self._task_spec(
                    title=f"Seedling inspection round - {plant.name} {plant.variety}",
                    description="Inspect for damping off, uneven growth, and tray temperature variation.",
                    category="inspection",
                    priority="medium",
                    status="postponed",
                    start_at=future_start,
                    duration_minutes=40,
                    required_items="inspection sheet, EC meter, sanitizer",
                    postponement_reason="Shifted to tomorrow because the propagation crew handled urgent transplanting first.",
                    manager_note="Keep this visible until all trays are checked.",
                    created_at=now - timedelta(hours=18),
                    worker_count=1,
                ),
                self._task_spec(
                    title=f"Transplant readiness review - {plant.name} {plant.variety}",
                    description=f"Confirm transplant window, plant size, and substrate condition for {plant.name}.",
                    category="general",
                    priority="medium",
                    status="scheduled",
                    start_at=future_start + timedelta(days=2),
                    duration_minutes=45,
                    required_items="clipboard, transplant map, PPE",
                    manager_note="Tie this to the weekly planning board.",
                    created_at=now - timedelta(hours=6),
                    worker_count=1,
                    recurring_series=recurring_plan,
                ),
            ]

        if stage_name == "vegetative":
            return [
                self._task_spec(
                    title=f"Vegetative feed application - {plant.name} {plant.variety}",
                    description=f"Apply scheduled feed and verify uniform coverage for {plant.name}.",
                    category="fertilizing",
                    priority=priority,
                    status="completed",
                    start_at=base_start,
                    duration_minutes=70,
                    required_items="fertilizer mix, injector, PPE",
                    worker_note="Feed applied evenly and runoff stayed within target.",
                    manager_note="Leaf color improved after the last correction.",
                    completion_note="Follow-up leaf tissue sample requested.",
                    created_at=base_start - timedelta(days=1),
                    recurring_series=recurring_plan,
                ),
                self._task_spec(
                    title=f"Irrigation pass - {plant.name} {plant.variety}",
                    description="Run the irrigation cycle and inspect drippers or channels for clogs.",
                    category="irrigation",
                    priority="medium",
                    status="scheduled",
                    start_at=future_start,
                    duration_minutes=50,
                    required_items="valve key, pressure gauge, drip repair kit",
                    manager_note="Prioritize outer rows where pressure drops first.",
                    created_at=now - timedelta(hours=15),
                    worker_count=1,
                    recurring_series=recurring_plan,
                ),
                self._task_spec(
                    title=f"Pruning and canopy shaping - {plant.name} {plant.variety}",
                    description=f"Thin growth and restore airflow around the {plant.name} block.",
                    category="maintenance",
                    priority="medium",
                    status="completed_pending_confirmation",
                    start_at=base_start + timedelta(days=3),
                    duration_minutes=80,
                    required_items="snips, twine, waste bins",
                    worker_note="Most rows completed; one edge row still needs a quick check.",
                    manager_note="Pending visual confirmation on the north edge.",
                    created_at=base_start + timedelta(days=2),
                    recurring_series=recurring_plan,
                ),
            ]

        if stage_name == "flowering":
            return [
                self._task_spec(
                    title=f"Flower set inspection - {plant.name} {plant.variety}",
                    description="Check flower set quality and note any stress signals during bloom.",
                    category="inspection",
                    priority=priority,
                    status="completed",
                    start_at=base_start,
                    duration_minutes=65,
                    required_items="inspection log, hand lens, thermometer",
                    worker_note="Set looked strong except in the cooler corner.",
                    manager_note="Increase monitoring on rows near the vents.",
                    completion_note="Confirmed and added to weekly bloom report.",
                    created_at=base_start - timedelta(days=1),
                ),
                self._task_spec(
                    title=f"Pest scouting round - {plant.name} {plant.variety}",
                    description="Scout the flowering canopy for thrips, mites, and fungal pressure.",
                    category="spraying",
                    priority="high",
                    status="postponed",
                    start_at=future_start,
                    duration_minutes=60,
                    required_items="sticky cards, scouting sheets, PPE",
                    postponement_reason="Postponed until the ventilation cycle stabilizes and the morning spray slot opens.",
                    manager_note="Run this before the next nutrient feed if possible.",
                    created_at=now - timedelta(hours=20),
                    worker_count=1,
                ),
                self._task_spec(
                    title=f"Bloom nutrient adjustment - {plant.name} {plant.variety}",
                    description="Adjust the bloom feed ratio and record conductivity after dosing.",
                    category="fertilizing",
                    priority=priority,
                    status="in_progress",
                    start_at=now - timedelta(hours=4),
                    duration_minutes=95,
                    required_items="feed chart, dosing pump, EC meter",
                    worker_note="Initial adjustment completed; recheck readings in the afternoon.",
                    manager_note="Keep this open until the second reading is logged.",
                    created_at=now - timedelta(days=1, hours=3),
                    recurring_series=recurring_plan,
                ),
            ]

        if stage_name == "fruiting":
            return [
                self._task_spec(
                    title=f"Fruit load support check - {plant.name} {plant.variety}",
                    description="Secure supports and remove weak fruit to balance the crop load.",
                    category="maintenance",
                    priority="high",
                    status="completed",
                    start_at=base_start,
                    duration_minutes=85,
                    required_items="clips, twine, collection bins",
                    worker_note="Support lines tightened and weak fruit removed where needed.",
                    manager_note="Crop load looks balanced after adjustment.",
                    completion_note="Checked during afternoon walk-through.",
                    created_at=base_start - timedelta(days=1),
                    recurring_series=recurring_plan,
                ),
                self._task_spec(
                    title=f"Targeted irrigation window - {plant.name} {plant.variety}",
                    description="Apply a controlled irrigation cycle to maintain fruit size and reduce cracking.",
                    category="irrigation",
                    priority="high",
                    status="scheduled",
                    start_at=future_start,
                    duration_minutes=55,
                    required_items="moisture probe, drip repair kit, pressure gauge",
                    manager_note="Pair this with moisture readings before sunrise.",
                    created_at=now - timedelta(hours=14),
                    worker_count=1,
                    recurring_series=recurring_plan,
                ),
                self._task_spec(
                    title=f"Disease scouting and spot treatment - {plant.name} {plant.variety}",
                    description="Inspect ripening crop for disease symptoms and apply targeted treatment if needed.",
                    category="spraying",
                    priority="high",
                    status="completed_pending_confirmation",
                    start_at=base_start + timedelta(days=4),
                    duration_minutes=75,
                    required_items="biofungicide, sprayer, PPE",
                    worker_note="Treatment applied to two short sections with suspect lesions.",
                    manager_note="Waiting for confirmation that the spotting has stabilized.",
                    created_at=base_start + timedelta(days=3),
                ),
            ]

        return [
            self._task_spec(
                title=f"Morning harvest round - {plant.name} {plant.variety}",
                description=f"Pick mature product from {plant.name} and move it to staging promptly.",
                category="harvesting",
                priority="high",
                status="completed",
                start_at=base_start,
                duration_minutes=120,
                required_items="harvest crates, knives, labels",
                worker_note="Morning harvest sorted and moved to dispatch area.",
                manager_note="Yield aligned with the expected picking plan.",
                completion_note="Confirmed against dispatch sheet.",
                created_at=base_start - timedelta(days=1),
                recurring_series=recurring_plan,
            ),
            self._task_spec(
                title=f"Next harvest queue - {plant.name} {plant.variety}",
                description=f"Prepare labor and materials for the next harvest pass of {plant.name}.",
                category="harvesting",
                priority="high",
                status="scheduled",
                start_at=future_start,
                duration_minutes=90,
                required_items="empty crates, labels, quality sheets",
                manager_note="Keep extra crates near the loading door.",
                created_at=now - timedelta(hours=12),
                worker_count=2,
                recurring_series=recurring_plan,
            ),
            self._task_spec(
                title=f"Post-harvest sanitation - {plant.name} {plant.variety}",
                description=f"Sanitize tools and staging surfaces after handling {plant.name}.",
                category="cleaning",
                priority="medium",
                status="completed_pending_confirmation",
                start_at=base_start + timedelta(days=2),
                duration_minutes=50,
                required_items="sanitizer, cloths, waste bags",
                worker_note="Sanitation completed, waiting on final checklist sign-off.",
                manager_note="Verify wash station records before closing.",
                created_at=base_start + timedelta(days=1),
                worker_count=1,
            ),
        ]

    def _task_spec(
        self,
        *,
        title,
        description,
        category,
        priority,
        status,
        start_at,
        duration_minutes,
        required_items,
        created_at,
        worker_note="",
        manager_note="",
        completion_note="",
        postponement_reason="",
        cancellation_reason="",
        worker_count=2,
        recurring_series=None,
    ):
        actual_start_at = None
        worker_completed_at = None
        manager_confirmed_at = None
        completion_confirmation_note = ""
        if status in {"completed", "completed_pending_confirmation", "in_progress"}:
            actual_start_at = start_at + timedelta(minutes=10)
        if status in {"completed", "completed_pending_confirmation"}:
            worker_completed_at = start_at + timedelta(minutes=duration_minutes)
        if status == "completed":
            manager_confirmed_at = start_at + timedelta(minutes=duration_minutes + 40)
            completion_confirmation_note = completion_note
        if status == "completed_pending_confirmation":
            completion_confirmation_note = "Worker submitted completion; manager review pending."

        end_at = start_at + timedelta(minutes=duration_minutes)
        updated_at = manager_confirmed_at or worker_completed_at or actual_start_at or created_at
        if status in {"scheduled", "postponed", "cancelled"}:
            updated_at = created_at + timedelta(hours=5)

        return {
            "title": title,
            "description": description,
            "category": category,
            "priority": priority,
            "status": status,
            "scheduled_start_at": start_at,
            "scheduled_end_at": end_at,
            "actual_start_at": actual_start_at,
            "worker_completed_at": worker_completed_at,
            "manager_confirmed_at": manager_confirmed_at,
            "required_items_text": required_items,
            "worker_note": worker_note,
            "manager_note": manager_note,
            "postponement_reason": postponement_reason,
            "cancellation_reason": cancellation_reason,
            "completion_confirmation_note": completion_confirmation_note,
            "created_at": created_at,
            "updated_at": updated_at,
            "worker_count": worker_count,
            "recurring_series": recurring_series,
        }

    def _build_history_specs(self, task, spec, selected_workers):
        created_at = spec["created_at"]
        history = [
            (
                created_at,
                "created",
                "",
                "",
                task.status,
                f"Task created for {task.plant.name} {task.plant.variety}.",
            ),
            (
                created_at + timedelta(minutes=30),
                "assigned_workers",
                "assignments",
                "",
                ", ".join(worker.get_full_name().strip() or worker.username for worker in selected_workers),
                "Workers assigned from the demo crew.",
            ),
        ]

        if spec["status"] in {"completed", "completed_pending_confirmation", "in_progress"}:
            history.append(
                (
                    spec["scheduled_start_at"] + timedelta(minutes=15),
                    "worker_progress",
                    "status",
                    "scheduled",
                    "in_progress",
                    "Crew started field work.",
                )
            )

        if spec["status"] == "completed":
            history.append(
                (
                    spec["worker_completed_at"],
                    "worker_completed",
                    "status",
                    "in_progress",
                    "completed_pending_confirmation",
                    "Worker reported completion and submitted notes.",
                )
            )
            history.append(
                (
                    spec["manager_confirmed_at"],
                    "manager_confirmed",
                    "status",
                    "completed_pending_confirmation",
                    "completed",
                    "Manager reviewed and confirmed the outcome.",
                )
            )
        elif spec["status"] == "completed_pending_confirmation":
            history.append(
                (
                    spec["worker_completed_at"],
                    "worker_completed",
                    "status",
                    "in_progress",
                    "completed_pending_confirmation",
                    "Completion submitted and waiting for manager review.",
                )
            )
        elif spec["status"] == "postponed":
            history.append(
                (
                    created_at + timedelta(hours=4),
                    "postponed",
                    "status",
                    "scheduled",
                    "postponed",
                    spec["postponement_reason"],
                )
            )
        elif spec["status"] == "scheduled":
            history.append(
                (
                    created_at + timedelta(hours=2),
                    "queued",
                    "status",
                    "",
                    "scheduled",
                    "Task added to the upcoming work queue.",
                )
            )

        return history

    def _build_comment_specs(self, task, spec, manager, selected_workers, task_index):
        worker = selected_workers[0]
        comments = [
            (
                spec["created_at"] + timedelta(minutes=20),
                manager,
                "note",
                f"Manager note: {task.description}",
            ),
        ]

        if spec["status"] in {"completed", "completed_pending_confirmation", "in_progress"}:
            comments.append(
                (
                    (spec["actual_start_at"] or spec["scheduled_start_at"]) + timedelta(minutes=25),
                    worker,
                    "completion" if spec["status"] != "in_progress" else "note",
                    spec["worker_note"] or "Crew updated progress from the field.",
                )
            )
        elif spec["status"] == "postponed":
            comments.append(
                (
                    spec["created_at"] + timedelta(hours=4, minutes=10),
                    worker,
                    "delay",
                    spec["postponement_reason"],
                )
            )
        else:
            comments.append(
                (
                    spec["created_at"] + timedelta(hours=1, minutes=15),
                    selected_workers[-1],
                    "note",
                    "Assignment reviewed and added to the upcoming shift board.",
                )
            )

        if task_index % 2 == 0:
            comments.append(
                (
                    spec["updated_at"] + timedelta(minutes=15),
                    manager,
                    "note",
                    task.manager_note or "Keep monitoring this block against the weekly plan.",
                )
            )

        return comments

    def _build_resource_specs(self, task, plant):
        used_at = task.actual_start_at or task.scheduled_start_at
        if task.category == "irrigation":
            return [
                (
                    "Water",
                    "water",
                    Decimal("180.00") + Decimal(task.id % 7) * Decimal("15.00"),
                    "liters",
                    f"Irrigation volume logged for {plant.name}.",
                    used_at + timedelta(minutes=30),
                )
            ]
        if task.category == "fertilizing":
            return [
                (
                    "Calcium nitrate",
                    "fertilizer",
                    Decimal("6.50") + Decimal(task.id % 5),
                    "kg",
                    f"Nutrient mix applied to {plant.name}.",
                    used_at + timedelta(minutes=35),
                )
            ]
        if task.category == "spraying":
            return [
                (
                    "Biofungicide",
                    "crop_protection",
                    Decimal("2.50") + Decimal(task.id % 3) * Decimal("0.75"),
                    "liters",
                    f"Spot treatment recorded for {plant.name}.",
                    used_at + timedelta(minutes=20),
                )
            ]
        if task.category == "harvesting":
            return [
                (
                    "Harvest crates",
                    "packaging",
                    Decimal("8.00") + Decimal(task.id % 4),
                    "units",
                    f"Crates allocated during {plant.name} harvest handling.",
                    used_at + timedelta(minutes=15),
                )
            ]
        if task.category == "maintenance":
            return [
                (
                    "Support twine",
                    "consumable",
                    Decimal("1.50") + Decimal(task.id % 6) * Decimal("0.30"),
                    "rolls",
                    f"Support material used while maintaining {plant.name}.",
                    used_at + timedelta(minutes=25),
                )
            ]
        return [
            (
                "Sanitizer",
                "cleaning",
                Decimal("1.20") + Decimal(task.id % 3) * Decimal("0.40"),
                "liters",
                f"Sanitation materials used during work on {plant.name}.",
                used_at + timedelta(minutes=10),
            )
        ]

    def _build_harvest_specs(self, plant, index):
        base_date = timezone.make_aware(
            datetime.combine(timezone.localdate() - timedelta(days=8 + index % 5), time(7, 30))
        )
        specs = [
            (
                base_date,
                Decimal("42.00") + Decimal(index % 7) * Decimal("4.50"),
                "kg",
                "A",
                f"Primary harvest lot recorded for {plant.name} {plant.variety}.",
            )
        ]
        if plant.status == "harvested":
            specs.append(
                (
                    base_date + timedelta(days=2),
                    Decimal("18.00") + Decimal(index % 5) * Decimal("2.25"),
                    "kg",
                    "B+",
                    f"Final cleanup harvest recorded before closing the cycle for {plant.name}.",
                )
            )
        return specs

    def _set_auto_timestamp(self, instance, created_at, updated_at):
        instance.__class__.objects.filter(pk=instance.pk).update(created_at=created_at, updated_at=updated_at)
        instance.created_at = created_at
        instance.updated_at = updated_at

    def _set_assignment_timestamp(self, instance, assigned_at):
        instance.__class__.objects.filter(pk=instance.pk).update(assigned_at=assigned_at)
        instance.assigned_at = assigned_at

    def _set_created_timestamp(self, instance, created_at):
        instance.__class__.objects.filter(pk=instance.pk).update(created_at=created_at)
        instance.created_at = created_at

    def _sync_raw_user(self, user, role):
        full_name = user.get_full_name().strip() or user.username
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO users (id, full_name, email, password_hash, role, is_active, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
                ON CONFLICT (id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    email = EXCLUDED.email,
                    password_hash = EXCLUDED.password_hash,
                    role = EXCLUDED.role,
                    is_active = EXCLUDED.is_active,
                    updated_at = NOW()
                """,
                [user.id, full_name, user.email, user.password, role, user.is_active],
            )
