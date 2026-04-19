from datetime import datetime, timedelta, timezone
import hashlib
import secrets
from typing import cast

from passlib.context import CryptContext
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database.models import AuthSessionORM, UserORM
from .models import LoginResponse, UserCreate, UserLogin

# `bcrypt` bywa problematyczny przy niektórych wersjach backendu i limicie 72 bajtów.
# pbkdf2_sha256 jest stabilny i nie ma tego ograniczenia.
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

class UserService:
    @staticmethod
    def hash_session_token(token: str) -> str:
        """Return a deterministic hash used for token-at-rest storage."""
        return hashlib.sha256(token.encode("utf-8")).hexdigest()

    @staticmethod
    def get_password_hash(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    @classmethod
    def get_user_by_email(cls, db: Session, email: str) -> UserORM | None:
        """Pobiera użytkownika po adresie email."""
        return cast(UserORM | None, db.query(UserORM).filter(UserORM.email == email).first())

    @classmethod
    def create_user(cls, db: Session, user_in: UserCreate) -> UserORM:
        """Tworzy nowego użytkownika z zhaszowanym hasłem i UUID."""
        if cls.get_user_by_email(db, user_in.email):
            raise ValueError("Użytkownik z tym adresem email już istnieje")

        hashed_password = cls.get_password_hash(user_in.password)

        db_user = UserORM(
            email=user_in.email,
            name=user_in.name,
            surname=user_in.surname,
            latitude=user_in.latitude,
            longitude=user_in.longitude,
            hashed_password=hashed_password,
        )
        db.add(db_user)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            raise ValueError("Użytkownik z tym adresem email już istnieje") from None
        db.refresh(db_user)

        return db_user

    @classmethod
    def authenticate_user(cls, db: Session, user_login: UserLogin) -> UserORM | None:
        """Weryfikuje credentials użytkownika."""
        user = cls.get_user_by_email(db, user_login.email)
        if not user:
            return None

        if not cls.verify_password(user_login.password, user.hashed_password):
            return None

        return user


    @staticmethod
    def create_session(db: Session, user: UserORM, hours_valid: int = 24) -> AuthSessionORM:
        raw_token = secrets.token_urlsafe(32)
        session = AuthSessionORM(
            user_id=user.id,
            token=UserService.hash_session_token(raw_token),
            expires_at=datetime.now(timezone.utc) + timedelta(hours=hours_valid),
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        session.token = raw_token
        return session

    @classmethod
    def login(cls, db: Session, user_login: UserLogin) -> LoginResponse | None:
        user = cls.authenticate_user(db, user_login)
        if not user:
            return None

        session = cls.create_session(db, user)
        return LoginResponse(access_token=session.token, user=user)

    @staticmethod
    def get_user_by_token(db: Session, token: str) -> UserORM | None:
        token_hash = UserService.hash_session_token(token)
        now = datetime.now(timezone.utc)
        session = (
            db.query(AuthSessionORM)
            .filter(AuthSessionORM.token == token_hash, AuthSessionORM.expires_at > now)
            .first()
        )
        if not session:
            return None

        return cast(UserORM | None, db.query(UserORM).filter(UserORM.id == session.user_id).first())

    @staticmethod
    def invalidate_session_by_token(db: Session, token: str) -> None:
        """Usuwa sesję po tokenie. Operacja jest idempotentna."""
        token_hash = UserService.hash_session_token(token)
        (
            db.query(AuthSessionORM)
            .filter(AuthSessionORM.token == token_hash)
            .delete(synchronize_session=False)
        )
        db.commit()

