# Weekly Reports Dashboard

A full-stack web application for teams to submit structured weekly work reports and for managers to track, filter, and analyze team activity through a visual dashboard.

## Tech Stack

**Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Recharts
**Backend:** FastAPI (Python), SQLAlchemy, JWT Authentication
**Database:** PostgreSQL (hosted on Supabase)

## Features

- Role-based authentication (Team Member / Manager)
- Personal weekly report creation, editing, and submission
- Manager dashboard with filters (by member, project, date range)
- Visual insights: submission status, workload distribution, trends over time
- Project/category management (CRUD)

## Prerequisites

- Node.js v18+
- Python 3.11+
- A free [Supabase](https://supabase.com) account (for PostgreSQL database)

## 1. Installing Dependencies

### Backend
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\Activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### Frontend
```bash
cd frontend
npm install
```

## 2. Running the Database (Supabase Setup)

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database → Connection Pooling**, copy the **Session pooler** connection string
3. In `backend/`, create a `.env` file with:

DATABASE_URL=postgresql://postgres.[project-ref]:[your-password]@[pooler-host]:5432/postgres
SECRET_KEY=your-random-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

Tables (`users`, `projects`, `reports`) are created automatically on first backend run — no manual migration needed.

## 3. Running the Backend

```bash
cd backend
.\venv\Scripts\Activate   # if not already activated
uvicorn app.main:app --reload
```

Backend runs at `http://127.0.0.1:8000`. API docs available at `http://127.0.0.1:8000/docs`.

## 4. Running the Frontend

```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:3000`.

## Usage

1. Register an account at `/register`, choosing role **Team Member** or **Manager**
2. Team Members: log in → create/edit/submit weekly reports at `/dashboard`
3. Managers: log in → view team dashboard, filters, charts, and manage projects at `/dashboard` and `/projects`

## Project Structure
```
weekly-reports-dashboard/
├── backend/
│   ├── app/
│   │   ├── core/       # DB connection, security, auth dependencies
│   │   ├── models/     # SQLAlchemy models
│   │   ├── schemas/    # Pydantic schemas
│   │   ├── routes/     # API endpoints
│   │   └── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/         # Next.js pages (login, register, dashboard, projects)
│   │   ├── components/  # UI components
│   │   ├── context/     # Auth context
│   │   └── lib/         # API clients
│   └── package.json
└── README.md
```
## Notes

- Role-based access is enforced at the API level (JWT + role checks), not via Supabase Row Level Security.
- Passwords are hashed with bcrypt; sessions use JWT bearer tokens.