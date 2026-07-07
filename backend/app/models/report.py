from sqlalchemy import Column, Integer, String, Text, Date, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class ReportStatus(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    late = "late"

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)

    week_start = Column(Date, nullable=False)
    week_end = Column(Date, nullable=False)

    tasks_completed = Column(Text, nullable=False)
    tasks_planned = Column(Text, nullable=False)
    blockers = Column(Text, nullable=True)
    hours_worked = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)

    status = Column(Enum(ReportStatus), default=ReportStatus.draft, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="reports")
    project = relationship("Project", backref="reports")