import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.append(str(Path(__file__).resolve().parents[1]))

from main import app
import src.app as app_module
from src.auth.service import UserService
from src.database.models import AuthSessionORM, UserORM
from src.database.session import Base, get_db


@pytest.fixture()
def auth_client():
    test_db_path = Path(__file__).resolve().parent / "test_auth_router.db"
    if test_db_path.exists():
        test_db_path.unlink()

    engine = create_engine(f"sqlite:///{test_db_path}", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    Base.metadata.create_all(bind=engine, tables=[UserORM.__table__, AuthSessionORM.__table__])
    original_engine = app_module.engine
    app_module.engine = engine

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    try:
        with TestClient(app) as client:
            yield client, TestingSessionLocal
    finally:
        app.dependency_overrides.clear()
        app_module.engine = original_engine
        Base.metadata.drop_all(bind=engine, tables=[AuthSessionORM.__table__, UserORM.__table__])
        engine.dispose()
        if test_db_path.exists():
            test_db_path.unlink()


def test_register_creates_user_with_profile_fields(auth_client):
    client, session_local = auth_client

    payload = {
        "email": "new.user@example.com",
        "name": "Anna",
        "surname": "Nowak",
        "password": "secret123",
    }

    response = client.post("/auth/register", json=payload)

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == payload["email"]
    assert "id" in body
    assert "password" not in body
    assert "hashed_password" not in body

    with session_local() as db:
        saved_user = db.query(UserORM).filter(UserORM.email == payload["email"]).first()
        assert saved_user is not None
        assert saved_user.name == payload["name"]
        assert saved_user.surname == payload["surname"]
        assert saved_user.hashed_password != payload["password"]


def test_register_duplicate_email_returns_400(auth_client):
    client, _ = auth_client

    payload = {
        "email": "duplicate@example.com",
        "name": "Jan",
        "surname": "Kowalski",
        "password": "secret123",
    }

    first = client.post("/auth/register", json=payload)
    second = client.post(
        "/auth/register",
        json={
            **payload,
            "name": "Adam",
            "surname": "Nowak",
        },
    )

    assert first.status_code == 201
    assert second.status_code == 400
    assert second.json()["detail"] == "Ten email jest już zarejestrowany"


def test_register_requires_profile_fields(auth_client):
    client, _ = auth_client

    missing_name = client.post(
        "/auth/register",
        json={
            "email": "missing.name@example.com",
            "surname": "Nowak",
            "password": "secret123",
        },
    )
    blank_surname = client.post(
        "/auth/register",
        json={
            "email": "blank.surname@example.com",
            "name": "Jan",
            "surname": "   ",
            "password": "secret123",
        },
    )

    assert missing_name.status_code == 422
    assert blank_surname.status_code == 422


def test_login_flow_unchanged_after_registration(auth_client):
    client, _ = auth_client

    register_payload = {
        "email": "login.user@example.com",
        "name": "Marta",
        "surname": "Kowalska",
        "password": "secret123",
    }

    register_response = client.post("/auth/register", json=register_payload)
    login_response = client.post(
        "/auth/login",
        json={"email": register_payload["email"], "password": register_payload["password"]},
    )

    assert register_response.status_code == 201
    assert login_response.status_code == 200

    body = login_response.json()
    assert body["token_type"] == "bearer"
    assert "access_token" in body
    assert body["user"]["email"] == register_payload["email"]
    assert "password" not in body["user"]
    assert "hashed_password" not in body["user"]


def test_logout_removes_current_session(auth_client):
    client, session_local = auth_client

    register_payload = {
        "email": "logout.user@example.com",
        "name": "Ola",
        "surname": "Nowak",
        "password": "secret123",
    }

    client.post("/auth/register", json=register_payload)
    login_response = client.post(
        "/auth/login",
        json={"email": register_payload["email"], "password": register_payload["password"]},
    )

    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    token_hash = UserService.hash_session_token(token)

    with session_local() as db:
        session_before = db.query(AuthSessionORM).filter(AuthSessionORM.token == token_hash).first()
        assert session_before is not None
        assert session_before.token != token

    logout_response = client.post("/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert logout_response.status_code == 204
    assert logout_response.content == b""

    with session_local() as db:
        session_after = db.query(AuthSessionORM).filter(AuthSessionORM.token == token_hash).first()
        assert session_after is None


def test_logout_invalidates_token_for_protected_endpoints(auth_client):
    client, _ = auth_client

    register_payload = {
        "email": "logout.me@example.com",
        "name": "Piotr",
        "surname": "Kowalski",
        "password": "secret123",
    }

    client.post("/auth/register", json=register_payload)
    login_response = client.post(
        "/auth/login",
        json={"email": register_payload["email"], "password": register_payload["password"]},
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    me_before = client.get("/auth/me", headers=headers)
    assert me_before.status_code == 200

    logout_response = client.post("/auth/logout", headers=headers)
    assert logout_response.status_code == 204

    me_after = client.get("/auth/me", headers=headers)
    assert me_after.status_code == 401


def test_logout_is_idempotent_when_session_already_absent(auth_client):
    client, _ = auth_client

    register_payload = {
        "email": "logout.idempotent@example.com",
        "name": "Adam",
        "surname": "Nowak",
        "password": "secret123",
    }

    client.post("/auth/register", json=register_payload)
    login_response = client.post(
        "/auth/login",
        json={"email": register_payload["email"], "password": register_payload["password"]},
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    first_logout = client.post("/auth/logout", headers=headers)
    second_logout = client.post("/auth/logout", headers=headers)

    assert first_logout.status_code == 204
    assert second_logout.status_code == 204


def test_protected_endpoints_require_bearer_token(auth_client):
    client, _ = auth_client

    me_response = client.get("/auth/me")
    logout_response = client.post("/auth/logout")

    assert me_response.status_code == 401
    assert me_response.headers.get("www-authenticate") == "Bearer"

    assert logout_response.status_code == 401
    assert logout_response.headers.get("www-authenticate") == "Bearer"
