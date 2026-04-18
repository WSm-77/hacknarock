from datetime import datetime
from enum import Enum
from typing import Any
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, model_validator


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

    available_blocks: list[TimeBlock] = Field(default_factory=list)
    maybe_blocks: list[TimeBlock] = Field(default_factory=list)
    coordinates: Coordinates | None = None


class MeetingStatus(str, Enum):
    COLLECTING_AVAILABILITY = "collecting_availability"
    READY_FOR_AI = "ready_for_ai"
    AI_RECOMMENDED = "ai_recommended"


class MeetingCreateRequest(BaseModel):
    proposed_blocks: list[TimeBlock] = Field(min_length=1)
    availability_deadline: datetime


class MeetingUpdateRequest(BaseModel):
    proposed_blocks: list[TimeBlock] = Field(min_length=1)
    availability_deadline: datetime


class MeetingVoteRequest(BaseModel):
    availability: ParticipantAvailability


class MeetingResponse(BaseModel):
    id: UUID
    organizer_id: UUID
    status: MeetingStatus
    availability_deadline: datetime
    proposed_blocks: list[TimeBlock]
    public_link: str
    ai_recommendation: str | None = None


class MeetingDetailsResponse(MeetingResponse):
    votes_count: int


class TriggerAIResponse(BaseModel):
    id: UUID
    status: MeetingStatus
    ai_recommendation: str
