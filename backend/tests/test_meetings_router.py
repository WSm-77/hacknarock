import sys
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.append(str(Path(__file__).resolve().parents[1]))

from main import app
from src.database.models import AuthSessionORM, MeetingORM, ParticipantVoteORM, UserORM
from src.database.session import Base, get_db


@pytest.fixture()
def meetings_client(tmp_path: Path):
    test_db_path = tmp_path / "test_meetings_router.db"
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


def test_meeting_happy_path_matches_database_model(meetings_client):
    client, session_local = meetings_client

    organizer_token = _register_and_login(client, "organizer.meeting@example.com", "secret123")
    participant_token = _register_and_login(client, "participant.meeting@example.com", "secret123")

    start = datetime.now(timezone.utc) + timedelta(minutes=10)
    end = start + timedelta(minutes=45)
    deadline = datetime.now(timezone.utc) + timedelta(seconds=1)

    create_payload = {
        "meeting_title": "Planowanie wyjazdu",
        "duration_minutes": 45,
        "location": "Warszawa",
        "description": "Spotkanie organizacyjne",
        "proposed_blocks": [{"start_time": start.isoformat(), "end_time": end.isoformat()}],
        "availability_deadline": deadline.isoformat(),
    }

    create_response = client.post(
        "/meetings",
        json=create_payload,
        headers={"Authorization": f"Bearer {organizer_token}"},
    )
    assert create_response.status_code == 201

    created = create_response.json()
    assert created["meeting_title"] == create_payload["meeting_title"]
    assert created["duration_minutes"] == create_payload["duration_minutes"]
    assert created["location"] == create_payload["location"]
    assert created["description"] == create_payload["description"]

    meeting_id = created["id"]
    public_token = created["public_link"].split("/")[-1]

    vote_payload = {
        "availability": {
            "available_blocks": [{"start_time": start.isoformat(), "end_time": end.isoformat()}],
            "maybe_blocks": [],
        }
    }
    vote_response = client.post(
        f"/meetings/join/{public_token}/availability",
        json=vote_payload,
        headers={"Authorization": f"Bearer {participant_token}"},
    )
    assert vote_response.status_code == 200

    time.sleep(1.2)

    details_response = client.get(
        f"/meetings/{meeting_id}",
        headers={"Authorization": f"Bearer {organizer_token}"},
    )
    assert details_response.status_code == 200
    details = details_response.json()
    assert details["status"] == "ready_for_ai"
    assert details["votes_count"] == 1

    with session_local() as db:
        saved_meeting = db.query(MeetingORM).filter(MeetingORM.id == meeting_id).first()
        assert saved_meeting is not None
        assert saved_meeting.meeting_title == create_payload["meeting_title"]
        assert saved_meeting.duration_minutes == create_payload["duration_minutes"]
        assert saved_meeting.location == create_payload["location"]

        saved_vote = db.query(ParticipantVoteORM).filter(ParticipantVoteORM.meeting_id == meeting_id).first()
        assert saved_vote is not None
        assert isinstance(saved_vote.available_blocks, list)
        assert isinstance(saved_vote.maybe_blocks, list)


def test_get_meeting_details_public_endpoint_returns_meeting_without_auth(meetings_client):
    client, _ = meetings_client

    organizer_token = _register_and_login(client, "public.details.organizer@example.com", "secret123")

    start = datetime.now(timezone.utc) + timedelta(minutes=10)
    end = start + timedelta(minutes=45)
    deadline = datetime.now(timezone.utc) + timedelta(minutes=20)

    create_payload = {
        "meeting_title": "Public details page",
        "duration_minutes": 45,
        "location": "Warszawa",
        "description": "Public endpoint regression",
        "proposed_blocks": [{"start_time": start.isoformat(), "end_time": end.isoformat()}],
        "availability_deadline": deadline.isoformat(),
    }

    create_response = client.post(
        "/meetings",
        json=create_payload,
        headers={"Authorization": f"Bearer {organizer_token}"},
    )
    assert create_response.status_code == 201
    meeting_id = create_response.json()["id"]

    details_response = client.get(f"/meetings/{meeting_id}/details")

    assert details_response.status_code == 200
    details = details_response.json()
    assert details["id"] == meeting_id
    assert details["meeting_title"] == create_payload["meeting_title"]
    assert details["votes_count"] == 0


def test_create_meeting_requires_database_required_fields(meetings_client):
    client, _ = meetings_client
    organizer_token = _register_and_login(client, "required.fields@example.com", "secret123")

    start = datetime.now(timezone.utc) + timedelta(minutes=10)
    end = start + timedelta(minutes=30)
    deadline = datetime.now(timezone.utc) + timedelta(minutes=5)

    missing_title_payload = {
        "duration_minutes": 30,
        "location": "Krakow",
        "proposed_blocks": [{"start_time": start.isoformat(), "end_time": end.isoformat()}],
        "availability_deadline": deadline.isoformat(),
    }

    response = client.post(
        "/meetings",
        json=missing_title_payload,
        headers={"Authorization": f"Bearer {organizer_token}"},
    )

    assert response.status_code == 422


def test_submit_participant_availability_accepts_subset_of_proposed_blocks(meetings_client):
    client, session_local = meetings_client

    organizer_token = _register_and_login(client, "subset.organizer@example.com", "secret123")
    participant_token = _register_and_login(client, "subset.participant@example.com", "secret123")

    proposed_start = datetime.now(timezone.utc) + timedelta(minutes=30)
    proposed_end = proposed_start + timedelta(minutes=60)
    deadline = datetime.now(timezone.utc) + timedelta(minutes=20)

    create_payload = {
        "meeting_title": "Subset validation",
        "duration_minutes": 30,
        "location": "Warszawa",
        "description": "Sprawdzenie podzbioru",
        "proposed_blocks": [{"start_time": proposed_start.isoformat(), "end_time": proposed_end.isoformat()}],
        "availability_deadline": deadline.isoformat(),
    }

    create_response = client.post(
        "/meetings",
        json=create_payload,
        headers={"Authorization": f"Bearer {organizer_token}"},
    )
    assert create_response.status_code == 201
    public_token = create_response.json()["public_link"].split("/")[-1]

    vote_payload = {
        "availability": {
            "available_blocks": [
                {
                    "start_time": (proposed_start + timedelta(minutes=15)).isoformat(),
                    "end_time": (proposed_start + timedelta(minutes=30)).isoformat(),
                }
            ],
            "maybe_blocks": [],
        }
    }
    vote_response = client.post(
        f"/meetings/join/{public_token}/availability",
        json=vote_payload,
        headers={"Authorization": f"Bearer {participant_token}"},
    )

    assert vote_response.status_code == 200

    with session_local() as db:
        meeting = db.query(MeetingORM).filter(MeetingORM.public_token == public_token).first()
        assert meeting is not None
        saved_vote = db.query(ParticipantVoteORM).filter(ParticipantVoteORM.meeting_id == meeting.id).first()
        assert saved_vote is not None
        assert len(saved_vote.available_blocks) == 1
        assert len(saved_vote.maybe_blocks) == 0


def test_submit_participant_availability_rejects_blocks_outside_proposed(meetings_client):
    client, session_local = meetings_client

    organizer_token = _register_and_login(client, "outside.organizer@example.com", "secret123")
    participant_token = _register_and_login(client, "outside.participant@example.com", "secret123")

    proposed_start = datetime.now(timezone.utc) + timedelta(minutes=30)
    proposed_end = proposed_start + timedelta(minutes=30)
    deadline = datetime.now(timezone.utc) + timedelta(minutes=20)

    create_payload = {
        "meeting_title": "Outside validation",
        "duration_minutes": 30,
        "location": "Krakow",
        "description": "Sprawdzenie odrzucenia",
        "proposed_blocks": [{"start_time": proposed_start.isoformat(), "end_time": proposed_end.isoformat()}],
        "availability_deadline": deadline.isoformat(),
    }

    create_response = client.post(
        "/meetings",
        json=create_payload,
        headers={"Authorization": f"Bearer {organizer_token}"},
    )
    assert create_response.status_code == 201
    public_token = create_response.json()["public_link"].split("/")[-1]

    vote_payload = {
        "availability": {
            "available_blocks": [
                {
                    "start_time": (proposed_end - timedelta(minutes=10)).isoformat(),
                    "end_time": (proposed_end + timedelta(minutes=5)).isoformat(),
                }
            ],
            "maybe_blocks": [],
        }
    }
    vote_response = client.post(
        f"/meetings/join/{public_token}/availability",
        json=vote_payload,
        headers={"Authorization": f"Bearer {participant_token}"},
    )

    assert vote_response.status_code == 400

    with session_local() as db:
        meeting = db.query(MeetingORM).filter(MeetingORM.public_token == public_token).first()
        assert meeting is not None
        saved_vote = db.query(ParticipantVoteORM).filter(ParticipantVoteORM.meeting_id == meeting.id).first()
        assert saved_vote is None


def test_submit_participant_availability_rejects_too_many_available_blocks(meetings_client):
    client, _ = meetings_client

    organizer_token = _register_and_login(client, "limit.organizer@example.com", "secret123")
    participant_token = _register_and_login(client, "limit.participant@example.com", "secret123")

    proposed_start = datetime.now(timezone.utc) + timedelta(minutes=30)
    proposed_end = proposed_start + timedelta(minutes=30)
    deadline = datetime.now(timezone.utc) + timedelta(minutes=20)

    create_payload = {
        "meeting_title": "Availability size limit",
        "duration_minutes": 30,
        "location": "Poznan",
        "description": "Sprawdzenie limitu listy",
        "proposed_blocks": [{"start_time": proposed_start.isoformat(), "end_time": proposed_end.isoformat()}],
        "availability_deadline": deadline.isoformat(),
    }

    create_response = client.post(
        "/meetings",
        json=create_payload,
        headers={"Authorization": f"Bearer {organizer_token}"},
    )
    assert create_response.status_code == 201
    public_token = create_response.json()["public_link"].split("/")[-1]

    oversized_blocks = [
        {
            "start_time": proposed_start.isoformat(),
            "end_time": proposed_end.isoformat(),
        }
        for _ in range(101)
    ]
    vote_payload = {
        "availability": {
            "available_blocks": oversized_blocks,
            "maybe_blocks": [],
        }
    }

    vote_response = client.post(
        f"/meetings/join/{public_token}/availability",
        json=vote_payload,
        headers={"Authorization": f"Bearer {participant_token}"},
    )

    assert vote_response.status_code == 422


def test_create_meeting_rejects_naive_datetime(meetings_client):
    client, _ = meetings_client

    organizer_token = _register_and_login(client, "naive.organizer@example.com", "secret123")

    start = (datetime.now(timezone.utc) + timedelta(minutes=10)).replace(tzinfo=None)
    end = (datetime.now(timezone.utc) + timedelta(minutes=40)).replace(tzinfo=None)
    deadline = (datetime.now(timezone.utc) + timedelta(seconds=1)).replace(tzinfo=None)

    create_payload = {
        "meeting_title": "Naive datetime acceptance",
        "duration_minutes": 30,
        "location": "Gdansk",
        "description": "Migracja 4a",
        "proposed_blocks": [{"start_time": start.isoformat(), "end_time": end.isoformat()}],
        "availability_deadline": deadline.isoformat(),
    }

    create_response = client.post(
        "/meetings",
        json=create_payload,
        headers={"Authorization": f"Bearer {organizer_token}"},
    )
    assert create_response.status_code == 422


def test_get_meeting_rejects_non_canonical_proposed_blocks_row(meetings_client):
    client, session_local = meetings_client

    organizer_token = _register_and_login(client, "canonical.organizer@example.com", "secret123")

    start = datetime.now(timezone.utc) + timedelta(minutes=10)
    end = start + timedelta(minutes=45)
    deadline = datetime.now(timezone.utc) + timedelta(minutes=5)

    create_payload = {
        "meeting_title": "Canonical enforcement",
        "duration_minutes": 45,
        "location": "Warszawa",
        "description": "Cutover guard",
        "proposed_blocks": [{"start_time": start.isoformat(), "end_time": end.isoformat()}],
        "availability_deadline": deadline.isoformat(),
    }

    create_response = client.post(
        "/meetings",
        json=create_payload,
        headers={"Authorization": f"Bearer {organizer_token}"},
    )
    assert create_response.status_code == 201
    meeting_id = create_response.json()["id"]

    with session_local() as db:
        meeting = db.query(MeetingORM).filter(MeetingORM.id == meeting_id).first()
        assert meeting is not None
        meeting.proposed_blocks = [{"day": "MON", "start_time": "10:00 AM", "end_time": "10:30 AM"}]
        db.commit()

    details_response = client.get(
        f"/meetings/{meeting_id}",
        headers={"Authorization": f"Bearer {organizer_token}"},
    )
    assert details_response.status_code == 409
    assert details_response.json()["detail"] == "Meeting contains non-canonical proposed_blocks data"


