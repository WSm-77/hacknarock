from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Dane przychodzące podczas rejestracji."""

    email: EmailStr
    password: str = Field(min_length=6, description="Hasło musi mieć minimum 6 znaków")
