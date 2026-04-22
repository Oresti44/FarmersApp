# Sample Data

Use the demo seed command after running migrations:

```powershell
cd backend
.\venv\Scripts\python manage.py migrate
.\venv\Scripts\python manage.py seed_demo_data --reset
```

If you already migrated the older version of this project, use a fresh PostgreSQL database before running these commands. The simplified schema replaces the old `api_*`, `auth_*`, admin, and session tables instead of keeping them.

The command fills every project table in the simplified schema:

- users
- farms, plots, greenhouses, plant_stages, plants
- recurring_task_series, tasks, task_assignments, task_comments, task_history
- harvest_history, resource_usage
- finance_partners, expense_categories, recurring_expenses, expense_records
- sales_deals, sales_deliveries, finance_transactions
- inventory_categories, inventory_items, inventory_movements

Demo manager login:

```text
email: manager@demo.farm
password: Demo12345!
```

All demo worker accounts use:

```text
password: Demo12345!
```

The `--reset` flag removes the previous Demo Valley Farm sample data and recreates it, so the dataset stays consistent when testing relationships.
