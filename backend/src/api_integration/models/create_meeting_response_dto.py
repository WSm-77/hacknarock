from uuid import UUID

from pydantic import BaseModel


class CreateMeetingResponseDTO(BaseModel):
    meeting_id: UUID
    poll_id: UUID
    status: str
    message: str
