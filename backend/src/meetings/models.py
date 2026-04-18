from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from db import Base


class MeetingORM(Base):
    __tablename__ = "meetings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    organizer_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    availability_deadline: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    proposed_blocks: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)
    public_token: Mapped[str] = mapped_column(String(128), unique=True, nullable=False, index=True)
    ai_recommendation: Mapped[str | None] = mapped_column(Text, nullable=True)


class ParticipantVoteORM(Base):
    __tablename__ = "participant_votes"
    __table_args__ = (UniqueConstraint("meeting_id", "participant_id", name="uq_vote_meeting_participant"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    meeting_id: Mapped[str] = mapped_column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    participant_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    available_blocks: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)
    maybe_blocks: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)

