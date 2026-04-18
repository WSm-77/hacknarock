from passlib.context import CryptContext
from sqlalchemy.orm import Session

from .models import UserCreate, UserLogin, UserORM

# `bcrypt` bywa problematyczny przy niektórych wersjach backendu i limicie 72 bajtów.
# pbkdf2_sha256 jest stabilny i nie ma tego ograniczenia.
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

class UserService:
    @staticmethod
    def get_password_hash(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    @classmethod
    def get_user_by_email(cls, db: Session, email: str) -> UserORM | None:
        """Pobiera użytkownika po adresie email."""
        return db.query(UserORM).filter(UserORM.email == email).first()

    @classmethod
    def create_user(cls, db: Session, user_in: UserCreate) -> UserORM:
        """Tworzy nowego użytkownika z zhaszowanym hasłem i UUID."""
        if cls.get_user_by_email(db, user_in.email):
            raise ValueError("Użytkownik z tym adresem email już istnieje")

        hashed_password = cls.get_password_hash(user_in.password)

        db_user = UserORM(email=user_in.email, hashed_password=hashed_password)
        db.add(db_user)
        db.commit()
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
