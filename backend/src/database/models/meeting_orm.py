from datetime import datetime
from uuid import uuid4

from sqlalchemy import JSON, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..session import Base


class MeetingORM(Base):
    __tablename__ = "meetings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    meeting_title: Mapped[str] = mapped_column(String(255), nullable=False)
    duration_minutes: Mapped[int] = mapped_column(nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    organizer_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    availability_deadline: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    proposed_blocks: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)
    public_token: Mapped[str] = mapped_column(String(128), unique=True, nullable=False, index=True)
    ai_recommendation: Mapped[str | None] = mapped_column(Text, nullable=True)
