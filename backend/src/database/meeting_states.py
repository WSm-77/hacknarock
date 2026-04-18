from enum import Enum

class MeetingStatus(str, Enum):
    COLLECTING_AVAILABILITY = "collecting_availability"
    FINALIZED = "finalized"
