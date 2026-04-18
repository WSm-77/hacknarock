from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.models import UserCreate, UserLogin, UserResponse
from auth.service import UserService
from db import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Rejestracja nowego użytkownika",
    description="Tworzy użytkownika i zapisuje w bazie tylko zhashowane hasło.",
    responses={
        400: {"description": "Email jest już zarejestrowany"},
    },
)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Rejestracja nowego użytkownika."""
    existing_user = UserService.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ten email jest już zarejestrowany",
        )

    new_user = UserService.create_user(db, user_data)
    return new_user


@router.post(
    "/login",
    response_model=UserResponse,
    summary="Logowanie użytkownika",
    description="Weryfikuje email i hasło, zwracając dane użytkownika przy poprawnych danych.",
    responses={
        401: {"description": "Nieprawidłowy email lub hasło"},
    },
)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Proste logowanie weryfikujące hasło i zwracające dane użytkownika."""
    user = UserService.authenticate_user(db, user_credentials)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nieprawidłowy email lub hasło",
        )

    return user