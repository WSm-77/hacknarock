from datetime import datetime
from uuid import uuid4

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..session import Base
from ..meeting_states import MeetingStatus


class MeetingORM(Base):
    __tablename__ = "meetings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    meeting_title: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    duration_minutes: Mapped[int] = mapped_column(nullable=True)
    location: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    organizer_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[MeetingStatus] = mapped_column(String(32), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    availability_deadline: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    proposed_blocks: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)
    participants_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    auto_find_venue: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    venue_recommendations_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    public_token: Mapped[str] = mapped_column(String(128), unique=True, nullable=False, index=True)
    ai_recommendation: Mapped[str | None] = mapped_column(Text, nullable=True)
