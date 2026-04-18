from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, Field

from meetings.common import ParticipantAvailability, TimeBlock


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

