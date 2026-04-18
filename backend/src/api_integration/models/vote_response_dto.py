from uuid import UUID

from pydantic import BaseModel


class VoteResponseDTO(BaseModel):
    poll_id: UUID
    option_id: str
    option_votes: int
    total_votes: int
