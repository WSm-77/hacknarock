from uuid import uuid4

from sqlalchemy import JSON, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from ..session import Base


class ParticipantVoteORM(Base):
    __tablename__ = "participant_votes"
    __table_args__ = (UniqueConstraint("meeting_id", "participant_id", name="uq_vote_meeting_participant"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    meeting_id: Mapped[str] = mapped_column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    participant_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    available_blocks: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)
    maybe_blocks: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)
