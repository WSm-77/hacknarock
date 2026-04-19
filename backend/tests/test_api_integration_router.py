import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.append(str(Path(__file__).resolve().parents[1]))

from main import _get_cors_origins, app
from src.database.models import AuthSessionORM, MeetingORM, ParticipantVoteORM, UserORM
from src.database.session import Base, get_db


@pytest.fixture()
def integration_client(tmp_path: Path):
    test_db_path = tmp_path / "test_api_integration_router.db"
    engine = create_engine(f"sqlite:///{test_db_path}", connect_args={"check_same_thread": False})
    testing_session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    Base.metadata.create_all(
        bind=engine,
        tables=[
            UserORM.__table__,
            AuthSessionORM.__table__,
            MeetingORM.__table__,
            ParticipantVoteORM.__table__,
        ],
    )

    def override_get_db():
        db = testing_session_local()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    try:
        with TestClient(app) as client:
            yield client, testing_session_local
    finally:
        app.dependency_overrides.clear()
        Base.metadata.drop_all(
            bind=engine,
            tables=[
                ParticipantVoteORM.__table__,
                MeetingORM.__table__,
                AuthSessionORM.__table__,
                UserORM.__table__,
            ],
        )
        engine.dispose()


def _register_and_login(client: TestClient, email: str, password: str) -> str:
    register_payload = {
        "email": email,
        "name": "Jan",
        "surname": "Kowalski",
        "password": password,
    }
    register_response = client.post("/auth/register", json=register_payload)
    assert register_response.status_code == 201

    login_response = client.post("/auth/login", json={"email": email, "password": password})
    assert login_response.status_code == 200
    return login_response.json()["access_token"]


def _create_meeting(client: TestClient, organizer_token: str) -> dict:
    start = datetime.now(timezone.utc) + timedelta(minutes=30)
    end = start + timedelta(minutes=60)
    deadline = datetime.now(timezone.utc) + timedelta(hours=4)

    payload = {
        "meeting_title": "Integration poll source",
        "duration_minutes": 30,
        "location": "Warszawa",
        "description": "Canonical source meeting",
        "proposed_blocks": [{"start_time": start.isoformat(), "end_time": end.isoformat()}],
        "availability_deadline": deadline.isoformat(),
    }
    response = client.post(
        "/meetings",
        json=payload,
        headers={"Authorization": f"Bearer {organizer_token}"},
    )
    assert response.status_code == 201
    return response.json()


def test_api_endpoints_require_authentication(integration_client):
    client, _ = integration_client

    dashboard = client.get("/api/dashboard")
    poll = client.get(f"/api/polls/{uuid4()}")
    vote = client.post(f"/api/polls/{uuid4()}/votes", json={"option_id": "option-1"})

    assert dashboard.status_code == 401
    assert poll.status_code == 401
    assert vote.status_code == 401


def test_api_meetings_create_surface_is_removed(integration_client):
    client, _ = integration_client
    token = _register_and_login(client, "removed.surface@example.com", "secret123")

    response = client.post(
        "/api/meetings",
        json={"title": "Deprecated create"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 404


def test_dashboard_poll_fetch_and_vote_flow_uses_meetings_as_source(integration_client):
    client, _ = integration_client

    organizer_token = _register_and_login(client, "organizer.integration@example.com", "secret123")
    voter_token = _register_and_login(client, "voter.integration@example.com", "secret123")
    created = _create_meeting(client, organizer_token)

    dashboard_response = client.get(
        "/api/dashboard",
        headers={"Authorization": f"Bearer {organizer_token}"},
    )
    assert dashboard_response.status_code == 200
    dashboard_payload = dashboard_response.json()

    polls_by_meeting = {item["meeting_id"]: item for item in dashboard_payload["polls"]}
    assert created["id"] in polls_by_meeting
    assert polls_by_meeting[created["id"]]["status"] == "collecting_votes"

    poll_response = client.get(
        f"/api/polls/{created['id']}",
        headers={"Authorization": f"Bearer {organizer_token}"},
    )
    assert poll_response.status_code == 200
    poll_payload = poll_response.json()
    assert poll_payload["poll_id"] == created["id"]
    assert len(poll_payload["options"]) == 1

    option_id = poll_payload["options"][0]["option_id"]
    vote_response = client.post(
        f"/api/polls/{created['id']}/votes",
        json={"option_id": option_id},
        headers={"Authorization": f"Bearer {voter_token}"},
    )
    assert vote_response.status_code == 200
    vote_payload = vote_response.json()
    assert vote_payload["option_id"] == option_id
    assert vote_payload["option_votes"] == 1
    assert vote_payload["total_votes"] == 1


def test_dashboard_rejects_non_canonical_storage_rows(integration_client):
    client, session_local = integration_client

    organizer_token = _register_and_login(client, "noncanonical.integration@example.com", "secret123")
    created = _create_meeting(client, organizer_token)

    with session_local() as db:
        meeting = db.query(MeetingORM).filter(MeetingORM.id == created["id"]).first()
        assert meeting is not None
        meeting.proposed_blocks = [{"day": "MON", "start_time": "10:00 AM", "end_time": "10:15 AM"}]
        db.commit()

    response = client.get(
        "/api/dashboard",
        headers={"Authorization": f"Bearer {organizer_token}"},
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Meeting contains non-canonical proposed_blocks data"


def test_poll_and_availability_endpoints_are_separate(integration_client):
    client, _ = integration_client

    organizer_token = _register_and_login(client, "separation.organizer@example.com", "secret123")
    participant_token = _register_and_login(client, "separation.participant@example.com", "secret123")
    created = _create_meeting(client, organizer_token)

    poll_response = client.get(
        f"/api/polls/{created['id']}",
        headers={"Authorization": f"Bearer {organizer_token}"},
    )
    assert poll_response.status_code == 200

    availability_payload = {
        "availability": {
            "available_blocks": created["proposed_blocks"],
            "maybe_blocks": [],
        }
    }
    availability_response = client.post(
        f"/meetings/join/{created['public_link'].split('/')[-1]}/availability",
        json=availability_payload,
        headers={"Authorization": f"Bearer {participant_token}"},
    )
    assert availability_response.status_code == 200


def test_votes_transition_status_to_waiting_for_confirmation_after_third_distinct_voter(integration_client) -> None:
    client, session_local = integration_client

    create_response = client.post(
        "/api/meetings",
        json={
            "title": "Vote threshold transition",
            "description": "Transition status after enough distinct voters",
            "organizer_name": "Wiktor",
        },
    )
    assert create_response.status_code == 201

    meeting_id = create_response.json()["meeting_id"]
    poll_id = create_response.json()["poll_id"]

    poll_response = client.get(f"/api/polls/{poll_id}")
    assert poll_response.status_code == 200
    option_id = poll_response.json()["options"][0]["option_id"]

    for voter_id in ["alice", "bob"]:
        vote_response = client.post(
            f"/api/polls/{poll_id}/votes",
            json={"option_id": option_id, "voter_id": voter_id},
        )
        assert vote_response.status_code == 200

        with session_local() as db:
            meeting = db.query(MeetingORM).filter(MeetingORM.id == meeting_id).first()
            assert meeting is not None
            assert meeting.status == "collecting_votes"

    third_vote_response = client.post(
        f"/api/polls/{poll_id}/votes",
        json={"option_id": option_id, "voter_id": "charlie"},
    )
    assert third_vote_response.status_code == 200

    with session_local() as db:
        meeting = db.query(MeetingORM).filter(MeetingORM.id == meeting_id).first()
        assert meeting is not None
        assert meeting.status == "waiting_for_confirmation"

    dashboard_response = client.get("/api/dashboard")
    assert dashboard_response.status_code == 200
    polls_by_meeting = {item["meeting_id"]: item for item in dashboard_response.json()["polls"]}
    assert meeting_id in polls_by_meeting
    assert polls_by_meeting[meeting_id]["status"] == "waiting_for_confirmation"


def test_poll_not_found_returns_404(integration_client):
    client, _ = integration_client
    token = _register_and_login(client, "poll.not.found@example.com", "secret123")

    response = client.get(
        f"/api/polls/{uuid4()}",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 404


def test_poll_id_must_be_uuid(integration_client) -> None:
    client, _ = integration_client
    token = _register_and_login(client, "poll.bad.id@example.com", "secret123")

    response = client.get(
        "/api/polls/not-a-uuid",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 422


def test_vote_rejects_invalid_option_id_format(integration_client) -> None:
    client, _ = integration_client

    organizer_token = _register_and_login(client, "invalid.option.organizer@example.com", "secret123")
    voter_token = _register_and_login(client, "invalid.option.voter@example.com", "secret123")
    created = _create_meeting(client, organizer_token)

    response = client.post(
        f"/api/polls/{created['id']}/votes",
        json={"option_id": "../../etc/passwd", "voter_id": "alice"},
        headers={"Authorization": f"Bearer {voter_token}"},
    )

    assert response.status_code == 422


def test_vote_rejects_unknown_option(integration_client) -> None:
    client, _ = integration_client

    organizer_token = _register_and_login(client, "unknown.option.organizer@example.com", "secret123")
    voter_token = _register_and_login(client, "unknown.option.voter@example.com", "secret123")
    created = _create_meeting(client, organizer_token)

    response = client.post(
        f"/api/polls/{created['id']}/votes",
        json={"option_id": "option-z"},
        headers={"Authorization": f"Bearer {voter_token}"},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid poll option"


def test_vote_returns_404_for_unknown_poll(integration_client) -> None:
    client, _ = integration_client
    token = _register_and_login(client, "unknown.poll.voter@example.com", "secret123")

    response = client.post(
        f"/api/polls/{uuid4()}/votes",
        json={"option_id": "option-1"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Poll not found"


def test_cors_origin_env_filters_wildcard_and_invalid(monkeypatch) -> None:
    monkeypatch.setenv(
        "FRONTEND_CORS_ORIGINS",
        "*, javascript:alert(1), https://example.com, http://localhost:5173",
    )

    origins = _get_cors_origins()

    assert "*" not in origins
    assert "javascript:alert(1)" not in origins
    assert "https://example.com" in origins
    assert "http://localhost:5173" in origins
