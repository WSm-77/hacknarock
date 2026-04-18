from .user_response import UserResponse


class UserInDB(UserResponse):
    """Wewnętrzny model bazy danych, zawiera zhashowane hasło."""

    hashed_password: str
