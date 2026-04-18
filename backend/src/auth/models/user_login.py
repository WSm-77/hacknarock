from pydantic import BaseModel, EmailStr


class UserLogin(BaseModel):
    """Dane przychodzące podczas logowania."""

    email: EmailStr
    password: str
