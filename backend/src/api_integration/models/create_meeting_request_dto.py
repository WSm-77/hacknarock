from pydantic import BaseModel, ConfigDict, Field


class CreateMeetingRequestDTO(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    title: str = Field(min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=2000)
    organizer_name: str | None = Field(default=None, max_length=120)
