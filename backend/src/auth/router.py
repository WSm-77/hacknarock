from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from ..database.models import UserORM
from ..database.session import get_db
from .dependencies import get_current_user, security
from .models import LoginResponse, UserCreate, UserLogin, UserResponse
from .service import UserService

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

    try:
        new_user = UserService.create_user(db, user_data)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ten email jest już zarejestrowany",
        ) from None
    return new_user


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Logowanie użytkownika",
    description="Weryfikuje email i haslo i zwraca token bearer oraz dane uzytkownika.",
    responses={
        401: {"description": "Nieprawidłowy email lub hasło"},
    },
)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Logowanie i wydanie tokenu sesyjnego."""
    auth_data = UserService.login(db, user_credentials)

    if not auth_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nieprawidłowy email lub hasło",
        )

    return auth_data


@router.get("/me", response_model=UserResponse, summary="Zwraca aktualnie zalogowanego uzytkownika")
def me(current_user: UserORM = Depends(get_current_user)):
    return current_user


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Wylogowanie użytkownika",
    description="Unieważnia aktualny token sesyjny bearer.",
)
def logout(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> Response:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Brak tokenu autoryzacyjnego",
            headers={"WWW-Authenticate": "Bearer"},
        )

    UserService.invalidate_session_by_token(db, credentials.credentials)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
