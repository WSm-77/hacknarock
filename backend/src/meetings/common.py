"""Compatibility exports for meetings models.

Prefer importing from `src.model.meetings_models`.
"""

from ..model.meetings_models import Coordinates, MeetingDetails, ParticipantAvailability, ProposedBlock, TimeBlock

__all__ = ["Coordinates", "MeetingDetails", "ParticipantAvailability", "ProposedBlock", "TimeBlock"]
