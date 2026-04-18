"""Compatibility exports for meetings request/response models.

Prefer importing from `src.model.meetings_models`.
"""

from ..model.meetings_models import (
    MeetingCreateRequest,
    MeetingDetailsResponse,
    MeetingResponse,
    MeetingStatus,
    MeetingUpdateRequest,
    MeetingVoteRequest,
    TriggerAIResponse,
)

__all__ = [
    "MeetingCreateRequest",
    "MeetingDetailsResponse",
    "MeetingResponse",
    "MeetingStatus",
    "MeetingUpdateRequest",
    "MeetingVoteRequest",
    "TriggerAIResponse",
]
