from enum import Enum


class MeetingStatus(str, Enum):
    COLLECTING_AVAILABILITY = "collecting_availability"
    WAITING_FOR_CONFIRMATION = "waiting_for_confirmation"
    FINALIZED = "finalized"
