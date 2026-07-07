from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user, require_manager
from app.models.report import Report, ReportStatus
from app.models.user import User
from app.schemas.report import ReportCreate, ReportUpdate, ReportOut
from typing import List, Optional
from datetime import date

router = APIRouter(prefix="/reports", tags=["reports"])

# Team member: create a report
@router.post("/", response_model=ReportOut)
def create_report(report: ReportCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_report = Report(
        user_id=current_user.id,
        project_id=report.project_id,
        week_start=report.week_start,
        week_end=report.week_end,
        tasks_completed=report.tasks_completed,
        tasks_planned=report.tasks_planned,
        blockers=report.blockers,
        hours_worked=report.hours_worked,
        notes=report.notes,
        status=ReportStatus.draft,
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report

# Team member: view own report history
@router.get("/me", response_model=List[ReportOut])
def get_my_reports(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Report).filter(Report.user_id == current_user.id).order_by(Report.week_start.desc()).all()

# Team member: edit own report
@router.put("/{report_id}", response_model=ReportOut)
def update_report(report_id: int, report: ReportUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_report = db.query(Report).filter(Report.id == report_id).first()
    if not db_report:
        raise HTTPException(status_code=404, detail="Report not found")
    if db_report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your report")

    for field, value in report.dict(exclude_unset=True).items():
        setattr(db_report, field, value)

    db.commit()
    db.refresh(db_report)
    return db_report

# Team member: submit a report
@router.post("/{report_id}/submit", response_model=ReportOut)
def submit_report(report_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_report = db.query(Report).filter(Report.id == report_id).first()
    if not db_report:
        raise HTTPException(status_code=404, detail="Report not found")
    if db_report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your report")

    db_report.status = ReportStatus.submitted
    db.commit()
    db.refresh(db_report)
    return db_report

# Manager: view all reports with filters
@router.get("/", response_model=List[ReportOut])
def get_all_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager),
    user_id: Optional[int] = Query(None),
    project_id: Optional[int] = Query(None),
    week_start: Optional[date] = Query(None),
    week_end: Optional[date] = Query(None),
):
    query = db.query(Report)
    if user_id:
        query = query.filter(Report.user_id == user_id)
    if project_id:
        query = query.filter(Report.project_id == project_id)
    if week_start:
        query = query.filter(Report.week_start >= week_start)
    if week_end:
        query = query.filter(Report.week_end <= week_end)
    return query.order_by(Report.week_start.desc()).all()