import sys
from pathlib import Path
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.append(str(Path(__file__).resolve().parents[1]))

from main import _get_cors_origins, app
from src.api_integration.repositories.database_repository import IntegrationDatabaseRepository
from src.database.models import MeetingORM, ParticipantVoteORM, UserORM
from src.database.session import Base, get_db


@pytest.fixture()
def integration_client():
    test_db_path = Path(__file__).resolve().parent / "test_api_integration_router.db"
    if test_db_path.exists():
        test_db_path.unlink()

    engine = create_engine(f"sqlite:///{test_db_path}", connect_args={"check_same_thread": False})
    testing_session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    Base.metadata.create_all(bind=engine, tables=[UserORM.__table__, MeetingORM.__table__, ParticipantVoteORM.__table__])

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
        Base.metadata.drop_all(bind=engine, tables=[ParticipantVoteORM.__table__, MeetingORM.__table__, UserORM.__table__])
        engine.dispose()
        if test_db_path.exists():
            test_db_path.unlink()


def _set_status(session_local, meeting_id: str, status: str, is_draft: bool = False) -> None:
    with session_local() as db:
        meeting = db.query(MeetingORM).filter(MeetingORM.id == meeting_id).first()
        assert meeting is not None
        meeting.status = status
        meeting.is_draft = is_draft
        db.commit()


def test_dashboard_is_available(integration_client):
    client, _ = integration_client

    response = client.get("/api/dashboard")

    assert response.status_code == 200
    payload = response.json()
    assert "active_meetings" in payload
    assert "upcoming_meetings" in payload
    assert "open_polls" in payload
    assert isinstance(payload["recent_meetings"], list)
    assert "polls" in payload
    assert "calendar_meetings" in payload
    assert isinstance(payload["polls"], list)
    assert isinstance(payload["calendar_meetings"], list)


def test_dashboard_uses_raw_statuses_maps_unknown_to_confirmed_and_filters_drafts(integration_client) -> None:
    client, session_local = integration_client

    waiting_response = client.post("/api/meetings", json={"title": "Waiting poll"})
    unknown_response = client.post("/api/meetings", json={"title": "Unknown poll"})
    draft_response = client.post("/api/meetings", json={"title": "Draft poll", "is_draft": True})

    assert waiting_response.status_code == 201
    assert unknown_response.status_code == 201
    assert draft_response.status_code == 201

    waiting_meeting_id = waiting_response.json()["meeting_id"]
    unknown_meeting_id = unknown_response.json()["meeting_id"]
    draft_meeting_id = draft_response.json()["meeting_id"]

    _set_status(session_local, waiting_meeting_id, "collecting_votes")
    _set_status(session_local, unknown_meeting_id, "totally-unknown-status")
    _set_status(session_local, draft_meeting_id, "draft", is_draft=True)

    dashboard_response = client.get("/api/dashboard")

    assert dashboard_response.status_code == 200
    payload = dashboard_response.json()

    polls_by_meeting = {item["meeting_id"]: item for item in payload["polls"]}
    assert waiting_meeting_id in polls_by_meeting
    assert polls_by_meeting[waiting_meeting_id]["status"] == "collecting_votes"
    assert unknown_meeting_id in polls_by_meeting
    assert polls_by_meeting[unknown_meeting_id]["status"] == "confirmed"
    assert draft_meeting_id not in polls_by_meeting

    calendar_by_meeting = {item["meeting_id"]: item for item in payload["calendar_meetings"]}
    assert waiting_meeting_id in calendar_by_meeting
    assert unknown_meeting_id in calendar_by_meeting
    assert draft_meeting_id not in calendar_by_meeting

    assert payload["open_polls"] == len(payload["polls"])


def test_dashboard_does_not_auto_transition_collecting_votes(integration_client) -> None:
    client, session_local = integration_client

    created = client.post("/api/meetings", json={"title": "No auto transition"})
    assert created.status_code == 201
    meeting_id = created.json()["meeting_id"]

    with session_local() as db:
        meeting = db.query(MeetingORM).filter(MeetingORM.id == meeting_id).first()
        assert meeting is not None
        meeting.status = "collecting_votes"
        db.commit()

    dashboard = client.get("/api/dashboard")
    assert dashboard.status_code == 200
    poll_entry = next(item for item in dashboard.json()["polls"] if item["meeting_id"] == meeting_id)
    assert poll_entry["status"] == "collecting_votes"


def test_create_meeting_defaults_to_collecting_votes_in_dashboard(integration_client) -> None:
    client, _ = integration_client

    created = client.post("/api/meetings", json={"title": "DB cutover status"})
    assert created.status_code == 201
    meeting_id = created.json()["meeting_id"]

    dashboard = client.get("/api/dashboard")
    assert dashboard.status_code == 200
    poll_entry = next(item for item in dashboard.json()["polls"] if item["meeting_id"] == meeting_id)
    assert poll_entry["status"] == "collecting_votes"


def test_dashboard_db_failure_returns_empty_poll_sections(monkeypatch, integration_client) -> None:
    client, _ = integration_client

    def _boom(*_args, **_kwargs):
        raise RuntimeError("db read failure")

    monkeypatch.setattr(IntegrationDatabaseRepository, "_count_participants", _boom)

    response = client.get("/api/dashboard")

    assert response.status_code == 200
    payload = response.json()
    assert set(payload.keys()) == {
        "active_meetings",
        "upcoming_meetings",
        "open_polls",
        "recent_meetings",
        "polls",
        "calendar_meetings",
    }
    assert isinstance(payload["active_meetings"], int)
    assert isinstance(payload["upcoming_meetings"], int)
    assert isinstance(payload["recent_meetings"], list)
    assert payload["polls"] == []
    assert payload["open_polls"] == 0
    assert payload["calendar_meetings"] == []


def test_meeting_creation_poll_fetch_and_voting_flow(integration_client):
    client, _ = integration_client

    create_response = client.post(
        "/api/meetings",
        json={
            "title": "Hackathon planning",
            "description": "Plan final architecture and tasks",
            "organizer_name": "Wiktor",
        },
    )

    assert create_response.status_code == 201
    create_payload = create_response.json()
    assert set(create_payload.keys()) == {"meeting_id", "poll_id", "status", "message"}
    poll_id = create_payload["poll_id"]

    poll_response = client.get(f"/api/polls/{poll_id}")
    assert poll_response.status_code == 200

    poll_payload = poll_response.json()
    assert set(poll_payload.keys()) == {
        "poll_id",
        "meeting_id",
        "question",
        "options",
        "total_votes",
    }
    assert poll_payload["poll_id"] == poll_id
    assert len(poll_payload["options"]) >= 1
    assert set(poll_payload["options"][0].keys()) == {"option_id", "label", "votes"}

    first_option = poll_payload["options"][0]["option_id"]
    vote_response = client.post(
        f"/api/polls/{poll_id}/votes",
        json={"option_id": first_option, "voter_id": "alice"},
    )

    assert vote_response.status_code == 200
    vote_payload = vote_response.json()
    assert set(vote_payload.keys()) == {"poll_id", "option_id", "option_votes", "total_votes"}
    assert vote_payload["option_id"] == first_option
    assert vote_payload["total_votes"] == 1

    updated_poll_response = client.get(f"/api/polls/{poll_id}")
    assert updated_poll_response.status_code == 200
    assert updated_poll_response.json()["total_votes"] == 1

    dashboard_response = client.get("/api/dashboard")
    assert dashboard_response.status_code == 200
    dashboard_payload = dashboard_response.json()

    polls_by_meeting = {item["meeting_id"]: item for item in dashboard_payload["polls"]}
    assert create_payload["meeting_id"] in polls_by_meeting
    assert polls_by_meeting[create_payload["meeting_id"]]["status"] == "collecting_votes"

    calendar_by_meeting = {item["meeting_id"]: item for item in dashboard_payload["calendar_meetings"]}
    assert create_payload["meeting_id"] in calendar_by_meeting


def test_poll_not_found_returns_404(integration_client):
    client, _ = integration_client

    response = client.get(f"/api/polls/{uuid4()}")

    assert response.status_code == 404


def test_poll_id_must_be_uuid(integration_client) -> None:
    client, _ = integration_client

    response = client.get("/api/polls/not-a-uuid")

    assert response.status_code == 422


def test_create_meeting_rejects_extra_fields(integration_client) -> None:
    client, _ = integration_client

    response = client.post(
        "/api/meetings",
        json={
            "title": "Security hardening",
            "description": "Validation test",
            "organizer_name": "Wiktor",
            "is_admin": True,
        },
    )

    assert response.status_code == 422


def test_vote_rejects_invalid_option_id_format(integration_client) -> None:
    client, _ = integration_client

    create_response = client.post(
        "/api/meetings",
        json={
            "title": "Poll validation",
            "description": "Validation test",
            "organizer_name": "Wiktor",
        },
    )
    poll_id = create_response.json()["poll_id"]

    response = client.post(
        f"/api/polls/{poll_id}/votes",
        json={"option_id": "../../etc/passwd", "voter_id": "alice"},
    )

    assert response.status_code == 422


def test_vote_rejects_unknown_option(integration_client) -> None:
    client, _ = integration_client

    create_response = client.post(
        "/api/meetings",
        json={
            "title": "Poll validation",
            "description": "Validation test",
            "organizer_name": "Wiktor",
        },
    )
    poll_id = create_response.json()["poll_id"]

    response = client.post(
        f"/api/polls/{poll_id}/votes",
        json={"option_id": "option-z", "voter_id": "alice"},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid poll option"


def test_vote_returns_404_for_unknown_poll(integration_client) -> None:
    client, _ = integration_client

    response = client.post(
        f"/api/polls/{uuid4()}/votes",
        json={"option_id": "option-a", "voter_id": "alice"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Poll not found"


def test_create_meeting_rejects_too_many_proposed_blocks(integration_client) -> None:
    client, _ = integration_client

    response = client.post(
        "/api/meetings",
        json={
            "title": "Payload limits",
            "description": "Validation test",
            "proposed_blocks": [{"day": "MON", "time": "10:00 AM"}] * 201,
        },
    )

    assert response.status_code == 422


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
