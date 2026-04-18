from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class DashboardMeetingDTO(BaseModel):
    meeting_id: UUID
    title: str
    status: str
    participants: int
    created_at: datetime
