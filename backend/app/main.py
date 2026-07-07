from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine
from app.routes import auth, reports, projects
from app.models import user, report, project  # ensures models are registered before create_all

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Weekly Reports Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(reports.router)
app.include_router(projects.router)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "API is running"}