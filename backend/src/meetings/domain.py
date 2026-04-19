"""Compatibility exports for meetings request/response models.

Prefer importing from `src.model.meetings_models`.
"""

from ..model.meetings_models import (
    MeetingCreateRequest,
    MeetingDetailsResponse,
    MeetingJoinResponse,
    MeetingResponse,
    MeetingStatus,
    MeetingUpdateRequest,
    MeetingVoteRequest,
    ParticipantAvailabilityResponse,
    TriggerAIResponse,
)

__all__ = [
    "MeetingCreateRequest",
    "MeetingDetailsResponse",
    "MeetingJoinResponse",
    "MeetingResponse",
    "MeetingStatus",
    "MeetingUpdateRequest",
    "MeetingVoteRequest",
    "ParticipantAvailabilityResponse",
    "TriggerAIResponse",
]
