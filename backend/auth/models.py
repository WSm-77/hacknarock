from uuid import UUID, uuid4
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from db import Base


class UserORM(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)


class AuthSessionORM(Base):
    __tablename__ = "auth_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

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
    """Wewnętrzny model bazy danych, zawiera zhaszowane hasło."""
    hashed_password: str


class LoginResponse(BaseModel):
    """Odpowiedź logowania z tokenem do autoryzacji kolejnych żądań."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
