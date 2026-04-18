from pydantic import BaseModel, ConfigDict, Field


class VoteRequestDTO(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    option_id: str = Field(min_length=1, max_length=64, pattern=r"^[a-zA-Z0-9_-]+$")
    voter_id: str | None = Field(default=None, max_length=120)
