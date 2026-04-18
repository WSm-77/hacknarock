from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    """Dane przychodzące podczas rejestracji."""

    email: EmailStr
    password: str = Field(min_length=6, description="Hasło musi mieć minimum 6 znaków")


class UserLogin(BaseModel):
    """Dane przychodzące podczas logowania."""

    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """To, co zwracamy na frontend (nigdy nie zwracaj hasła!)."""

    id: UUID
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)


class UserInDB(UserResponse):
    """Wewnętrzny model bazy danych, zawiera zhashowane hasło."""

    hashed_password: str


class LoginResponse(BaseModel):
    """Odpowiedź logowania z tokenem do autoryzacji kolejnych żądań."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse
