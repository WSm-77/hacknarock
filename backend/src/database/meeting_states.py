from enum import Enum

class MeetingStatus(str, Enum):
    COLLECTING_AVAILABILITY = "collecting_availability"
    READY_FOR_AI = "ready_for_ai"
    AI_RECOMMENDED = "ai_recommended"
