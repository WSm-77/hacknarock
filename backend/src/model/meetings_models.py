from datetime import datetime
from enum import Enum
from typing import Any
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, model_validator

from database.meeting_states import MeetingStatus


class Coordinates(BaseModel):
    """Dokładne współrzędne geograficzne uczestnika wybrane na mapie."""

    latitude: float
    longitude: float


class MeetingDetails(BaseModel):
    """Hybrydowe szczegóły spotkania."""

    title: str
    description: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class TimeBlock(BaseModel):
    """Podstawowy przedział czasowy."""

    start_time: datetime
    end_time: datetime

    @model_validator(mode="after")
    def check_time_order(self) -> "TimeBlock":
        if self.start_time >= self.end_time:
            raise ValueError("Czas rozpoczęcia musi być wcześniejszy niż czas zakończenia.")
        return self


class ProposedBlock(TimeBlock):
    """Przedział czasowy zaproponowany przez organizatora."""

    id: UUID = Field(default_factory=uuid4)


class ParticipantAvailability(BaseModel):
    """Zbiór przedziałów czasowych i lokalizacji uczestnika dla danego spotkania."""

    available_blocks: list[TimeBlock] = Field(default_factory=list, max_length=100)
    maybe_blocks: list[TimeBlock] = Field(default_factory=list, max_length=100)
    coordinates: Coordinates | None = None


class MeetingStatus(str, Enum):
    COLLECTING_AVAILABILITY = "collecting_availability"
    FINALIZED = "finalized"
    READY_FOR_AI = "ready_for_ai"
    AI_RECOMMENDED = "ai_recommended"


class MeetingCreateRequest(BaseModel):
    meeting_title: str = Field(min_length=1, max_length=255)
    duration_minutes: int = Field(ge=1, le=1440)
    location: str = Field(min_length=1, max_length=255)
    description: str | None = None
    proposed_blocks: list[TimeBlock] = Field(min_length=1, max_length=100)
    availability_deadline: datetime


class MeetingUpdateRequest(BaseModel):
    meeting_title: str = Field(min_length=1, max_length=255)
    duration_minutes: int = Field(ge=1, le=1440)
    location: str = Field(min_length=1, max_length=255)
    description: str | None = None
    proposed_blocks: list[TimeBlock] = Field(min_length=1, max_length=100)
    availability_deadline: datetime


class MeetingVoteRequest(BaseModel):
    availability: ParticipantAvailability


class MeetingResponse(BaseModel):
    id: UUID
    organizer_id: UUID
    organizer_name: str | None = None
    title: str
    description: str | None = None
    location: str | None = None
    duration_minutes: int
    participants_count: int | None = None
    is_draft: bool = False
    status: MeetingStatus
    availability_deadline: datetime
    proposed_blocks: list[TimeBlock]
    public_link: str
    ai_recommendation: str | None = None
    created_at: datetime | None = None


class MeetingJoinResponse(BaseModel):
    id: UUID
    meeting_title: str
    duration_minutes: int
    location: str
    description: str | None = None
    status: MeetingStatus
    availability_deadline: datetime
    proposed_blocks: list[dict[str, Any]]
    public_link: str
    ai_recommendation: str | None = None


class ParticipantAvailabilityResponse(BaseModel):
    participant_id: UUID
    available_blocks: list[TimeBlock]
    maybe_blocks: list[TimeBlock]


class MeetingDetailsResponse(MeetingResponse):
    votes_count: int
    auto_find_venue: bool = False
    venue_recommendations_count: int | None = None
    participant_availabilities: list[ParticipantAvailabilityResponse] = Field(default_factory=list)


class TriggerAIResponse(BaseModel):
    id: UUID
    status: MeetingStatus
    ai_recommendation: str
