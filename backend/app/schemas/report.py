from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional
from app.models.report import ReportStatus

class ReportCreate(BaseModel):
    project_id: Optional[int] = None
    week_start: date
    week_end: date
    tasks_completed: str
    tasks_planned: str
    blockers: Optional[str] = None
    hours_worked: Optional[float] = None
    notes: Optional[str] = None

class ReportUpdate(BaseModel):
    project_id: Optional[int] = None
    week_start: Optional[date] = None
    week_end: Optional[date] = None
    tasks_completed: Optional[str] = None
    tasks_planned: Optional[str] = None
    blockers: Optional[str] = None
    hours_worked: Optional[float] = None
    notes: Optional[str] = None

class ReportOut(BaseModel):
    id: int
    user_id: int
    project_id: Optional[int]
    week_start: date
    week_end: date
    tasks_completed: str
    tasks_planned: str
    blockers: Optional[str]
    hours_worked: Optional[float]
    notes: Optional[str]
    status: ReportStatus
    created_at: datetime

    class Config:
        from_attributes = True