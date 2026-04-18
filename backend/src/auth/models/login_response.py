from pydantic import BaseModel

from .user_response import UserResponse


class LoginResponse(BaseModel):
    """Odpowiedź logowania z tokenem do autoryzacji kolejnych żądań."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse
