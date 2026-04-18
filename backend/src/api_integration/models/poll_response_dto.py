from uuid import UUID

from pydantic import BaseModel

from .poll_option_dto import PollOptionDTO


class PollResponseDTO(BaseModel):
    poll_id: UUID
    meeting_id: UUID
    question: str
    options: list[PollOptionDTO]
    total_votes: int
