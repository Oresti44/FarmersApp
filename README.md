# FarmersApp

FarmersApp is a farm operations website for managing daily agricultural work from one dashboard. Managers can track crops, plots, greenhouses, work tasks, inventory, harvest activity, expenses, sales, and finance summaries. Workers can log in to view assigned tasks, update progress, leave notes, and submit completed work for manager confirmation.

## Features

- Public landing page with login and signup.
- Manager dashboard with finance, inventory, task, and plant overview metrics.
- Plant management for farms, plots, greenhouses, crop stages, harvest history, and resource usage.
- Work task planning with assignments, priorities, statuses, comments, history, and worker completion flow.
- Inventory tracking for categories, stock levels, low-stock alerts, and item movements.
- Finance tracking for partners, expenses, recurring costs, sales deals, deliveries, and transactions.
- Demo seed data for testing the full workflow quickly.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, plain JavaScript.
- Backend: Django, Django REST Framework, django-cors-headers, python-dotenv.
- Database: PostgreSQL with Django migrations.

## Project Structure

- `frontend/` - React application, UI components, feature modules, and Vite configuration.
- `backend/` - Django API, settings, migrations, and demo seed command.
- `*.pdf` - Project documentation files kept in the repository root.

## Prerequisites

- Node.js and npm.
- Python 3.11+.
- PostgreSQL running locally or accessible through the values in `backend/.env`.

## Run the Frontend

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and calls the backend through `VITE_API_URL`.

## Run the Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py migrate
python manage.py runserver
```

The backend runs at `http://localhost:8000/api/`. Update `backend/.env` if your PostgreSQL database name, user, password, host, or port is different.

## Run the Backend with Sample Data

After the backend dependencies are installed and migrations are applied, load the demo dataset:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py migrate
python manage.py seed_demo_data --reset
python manage.py runserver
```

Demo manager login:

```text
email: manager@demo.farm
password: Demo12345!
```

All demo worker accounts use `Demo12345!` as the password.

## Useful Checks

```powershell
cd backend
.\venv\Scripts\python manage.py check
```

```powershell
cd frontend
npm run build
```
