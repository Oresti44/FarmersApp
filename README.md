# FarmersApp

Starter monorepo for a React + Django + PostgreSQL + Tailwind application.

## Structure

- `frontend/` - Vite + React frontend with Tailwind wired through the Vite plugin
- `backend/` - Django backend with Django REST Framework, CORS, dotenv, and PostgreSQL-ready settings

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

## Backend

```powershell
cd backend
.\venv\Scripts\Activate.ps1
Copy-Item .env.example .env
python manage.py migrate
python manage.py runserver
```

## PostgreSQL setup

Update `backend/.env` with your real database credentials before running migrations.

Default development values expect:

- Database name: `farmers_platform`
- Host: `localhost`
- Port: `5432`

## Useful checks

```powershell
cd backend
.\venv\Scripts\python manage.py check
```

```powershell
cd frontend
npm run build
```
