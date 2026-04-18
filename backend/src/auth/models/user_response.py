from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


class UserResponse(BaseModel):
    """To, co zwracamy na frontend (nigdy nie zwracaj hasła!)."""

    id: UUID
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)
