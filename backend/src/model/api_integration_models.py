from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class DashboardMeetingDTO(BaseModel):
    meeting_id: UUID
    title: str
    status: str
    participants: int
    created_at: datetime


class DashboardPollDTO(BaseModel):
    meeting_id: UUID
    poll_id: UUID | None
    title: str
    status: str
    participants: int
    created_at: datetime


class DashboardCalendarMeetingDTO(BaseModel):
    meeting_id: UUID
    title: str
    status: str
    start_at: datetime
    end_at: datetime


class DashboardResponseDTO(BaseModel):
    active_meetings: int
    upcoming_meetings: int
    open_polls: int
    recent_meetings: list[DashboardMeetingDTO]
    polls: list[DashboardPollDTO] = Field(default_factory=list)
    calendar_meetings: list[DashboardCalendarMeetingDTO] = Field(default_factory=list)


class CreateMeetingRequestDTO(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    title: str = Field(min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=2000)
    organizer_name: str | None = Field(default=None, max_length=120)
    is_draft: bool = Field(default=False)
    duration_minutes: int | None = Field(default=None, ge=15, le=1440)
    location: str | None = Field(default=None, max_length=255)
    participants_count: int | None = Field(default=None, ge=1, le=100000)
    expiration: date | None = Field(default=None)
    auto_venue: bool = Field(default=False)
    venue_recommendations_count: int | None = Field(default=None, ge=1, le=50)
    proposed_blocks: list[dict[str, str]] = Field(default_factory=list, max_length=200)

    @field_validator("proposed_blocks")
    @classmethod
    def validate_proposed_blocks(cls, value: list[dict[str, str]]) -> list[dict[str, str]]:
        for block in value:
            if len(block) > 8:
                raise ValueError("Each proposed block may contain at most 8 fields")

            for key, raw_item in block.items():
                key_text = str(key)
                item = str(raw_item)
                if len(key_text) > 32:
                    raise ValueError("Proposed block keys must be at most 32 characters")
                if len(item) > 64:
                    raise ValueError("Proposed block values must be at most 64 characters")

        return value


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
