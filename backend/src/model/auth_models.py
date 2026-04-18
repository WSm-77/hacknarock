from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    """Dane przychodzące podczas rejestracji."""

    email: EmailStr
    name: str = Field(min_length=1, max_length=100, description="Imię użytkownika")
    surname: str = Field(min_length=1, max_length=100, description="Nazwisko użytkownika")
    latitude: float | None = Field(
        default=None,
        ge=-90.0,
        le=90.0,
        description="Opcjonalna szerokość geograficzna użytkownika",
    )
    longitude: float | None = Field(
        default=None,
        ge=-180.0,
        le=180.0,
        description="Opcjonalna długość geograficzna użytkownika",
    )
    password: str = Field(
        min_length=8,
        max_length=128,
        description="Hasło musi mieć od 8 do 128 znaków",
    )

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return value.strip().lower()

    @field_validator("name", "surname")
    @classmethod
    def normalize_required_text(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Pole nie może być puste")
        return normalized


class UserLogin(BaseModel):
    """Dane przychodzące podczas logowania."""

    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return value.strip().lower()


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
