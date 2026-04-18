from pydantic import BaseModel


class PollOptionDTO(BaseModel):
    option_id: str
    label: str
    votes: int
