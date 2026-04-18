from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class DashboardMeetingDTO(BaseModel):
    meeting_id: UUID
    title: str
    status: str
    participants: int
    created_at: datetime


class DashboardResponseDTO(BaseModel):
    active_meetings: int
    upcoming_meetings: int
    open_polls: int
    recent_meetings: list[DashboardMeetingDTO]


class CreateMeetingRequestDTO(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    title: str = Field(min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=2000)
    organizer_name: str | None = Field(default=None, max_length=120)


class CreateMeetingResponseDTO(BaseModel):
    meeting_id: UUID
    poll_id: UUID
    status: str
    message: str


class PollOptionDTO(BaseModel):
    option_id: str
    label: str
    votes: int


class PollResponseDTO(BaseModel):
    poll_id: UUID
    meeting_id: UUID
    question: str
    options: list[PollOptionDTO]
    total_votes: int


class VoteRequestDTO(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    option_id: str = Field(min_length=1, max_length=64, pattern=r"^[a-zA-Z0-9_-]+$")
    voter_id: str | None = Field(default=None, max_length=120)


class VoteResponseDTO(BaseModel):
    poll_id: UUID
    option_id: str
    option_votes: int
    total_votes: int
