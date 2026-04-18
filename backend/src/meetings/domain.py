from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field











    organizer_id: UUID
    status: MeetingStatus
    availability_deadline: datetime
    proposed_blocks: list[TimeBlock]
    public_link: str
    ai_recommendation: str | None = None





