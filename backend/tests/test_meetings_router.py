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


def test_submit_participant_availability_updates_existing_participant_vote(meetings_client):
    client, session_local = meetings_client

    organizer_token = _register_and_login(client, "update.organizer@example.com", "secret123")
    participant_token = _register_and_login(client, "update.participant@example.com", "secret123")

    proposed_start = datetime.now(timezone.utc) + timedelta(minutes=30)
    proposed_end = proposed_start + timedelta(minutes=60)
    deadline = datetime.now(timezone.utc) + timedelta(minutes=20)

    create_payload = {
        "meeting_title": "Existing participant update",
        "duration_minutes": 30,
        "location": "Lodz",
        "description": "Sprawdzenie aktualizacji glosu",
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

    first_payload = {
        "availability": {
            "available_blocks": [
                {
                    "start_time": proposed_start.isoformat(),
                    "end_time": (proposed_start + timedelta(minutes=20)).isoformat(),
                }
            ],
            "maybe_blocks": [],
        }
    }
    first_response = client.post(
        f"/meetings/join/{public_token}/availability",
        json=first_payload,
        headers={"Authorization": f"Bearer {participant_token}"},
    )
    assert first_response.status_code == 200

    second_payload = {
        "availability": {
            "available_blocks": [],
            "maybe_blocks": [
                {
                    "start_time": (proposed_start + timedelta(minutes=20)).isoformat(),
                    "end_time": (proposed_start + timedelta(minutes=40)).isoformat(),
                }
            ],
        }
    }
    second_response = client.post(
        f"/meetings/join/{public_token}/availability",
        json=second_payload,
        headers={"Authorization": f"Bearer {participant_token}"},
    )
    assert second_response.status_code == 200

    with session_local() as db:
        meeting = db.query(MeetingORM).filter(MeetingORM.public_token == public_token).first()
        assert meeting is not None
        participant = db.query(UserORM).filter(UserORM.email == "update.participant@example.com").first()
        assert participant is not None
        votes = (
            db.query(ParticipantVoteORM)
            .filter(
                ParticipantVoteORM.meeting_id == meeting.id,
                ParticipantVoteORM.participant_id == participant.id,
            )
            .all()
        )
        assert len(votes) == 1

        saved_vote = votes[0]
        assert saved_vote is not None
        assert len(saved_vote.available_blocks) == 0
        assert len(saved_vote.maybe_blocks) == 1


def test_create_meeting_accepts_naive_datetime_and_transitions_deadline(meetings_client):
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
    assert create_response.status_code == 201
    meeting_id = create_response.json()["id"]

    time.sleep(1.2)

    details_response = client.get(
        f"/meetings/{meeting_id}",
        headers={"Authorization": f"Bearer {organizer_token}"},
    )
    assert details_response.status_code == 200
    assert details_response.json()["status"] == "ready_for_ai"


def test_join_endpoint_returns_canonical_proposed_blocks_for_integration_meeting(meetings_client):
    client, session_local = meetings_client

    participant_token = _register_and_login(client, "join.integration@example.com", "secret123")
    expiration = (datetime.now(timezone.utc) + timedelta(days=14)).date().isoformat()

    create_payload = {
        "title": "Integration canonical blocks",
        "description": "Legacy day/time input",
        "is_draft": False,
        "duration_minutes": 30,
        "location": "Warszawa",
        "participants_count": 5,
        "expiration": expiration,
        "auto_venue": False,
        "proposed_blocks": [
            {
                "day": "MON",
                "start_time": "10:00 AM",
                "end_time": "11:00 AM",
            },
            {
                "day": "MON",
                "start_time": "11:00 AM",
                "end_time": "12:00 PM",
            },
        ],
    }

    create_response = client.post("/api/meetings", json=create_payload)
    assert create_response.status_code == 201
    meeting_id = create_response.json()["meeting_id"]

    with session_local() as db:
        meeting = db.query(MeetingORM).filter(MeetingORM.id == meeting_id).first()
        assert meeting is not None
        assert meeting.public_token
        assert meeting.proposed_blocks
        assert all(set(block.keys()) == {"start_time", "end_time"} for block in meeting.proposed_blocks)
        public_token = meeting.public_token

    join_response = client.get(
        f"/meetings/join/{public_token}",
        headers={"Authorization": f"Bearer {participant_token}"},
    )
    assert join_response.status_code == 200
    join_payload = join_response.json()
    assert join_payload["proposed_blocks"]

    for block in join_payload["proposed_blocks"]:
        assert set(block.keys()) == {"start_time", "end_time"}
        start = datetime.fromisoformat(block["start_time"].replace("Z", "+00:00"))
        end = datetime.fromisoformat(block["end_time"].replace("Z", "+00:00"))
        assert start.tzinfo is not None
        assert end.tzinfo is not None
        assert start < end


def test_join_endpoint_returns_canonical_proposed_blocks_for_regular_meeting(meetings_client):
    client, _ = meetings_client

    organizer_token = _register_and_login(client, "join.regular.organizer@example.com", "secret123")
    participant_token = _register_and_login(client, "join.regular.participant@example.com", "secret123")

    start = datetime.now(timezone.utc) + timedelta(minutes=30)
    end = start + timedelta(minutes=45)
    deadline = datetime.now(timezone.utc) + timedelta(minutes=20)

    create_payload = {
        "meeting_title": "Regular canonical blocks",
        "duration_minutes": 30,
        "location": "Warszawa",
        "description": "Join endpoint shape",
        "proposed_blocks": [{"start_time": start.isoformat(), "end_time": end.isoformat()}],
        "availability_deadline": deadline.isoformat(),
    }

    create_response = client.post(
        "/meetings",
        json=create_payload,
        headers={"Authorization": f"Bearer {organizer_token}"},
    )
    assert create_response.status_code == 201
    public_token = create_response.json()["public_link"].split("/")[-1]

    join_response = client.get(
        f"/meetings/join/{public_token}",
        headers={"Authorization": f"Bearer {participant_token}"},
    )
    assert join_response.status_code == 200

    payload = join_response.json()
    assert payload["proposed_blocks"]
    for block in payload["proposed_blocks"]:
        assert set(block.keys()) == {"start_time", "end_time"}
        parsed_start = datetime.fromisoformat(block["start_time"].replace("Z", "+00:00"))
        parsed_end = datetime.fromisoformat(block["end_time"].replace("Z", "+00:00"))
        assert parsed_start.tzinfo is not None
        assert parsed_end.tzinfo is not None
        assert parsed_start < parsed_end


def test_join_endpoint_returns_canonical_proposed_blocks_for_legacy_normalized_data(meetings_client):
    client, session_local = meetings_client

    organizer_token = _register_and_login(client, "join.legacy.organizer@example.com", "secret123")
    participant_token = _register_and_login(client, "join.legacy.participant@example.com", "secret123")

    with session_local() as db:
        organizer = db.query(UserORM).filter(UserORM.email == "join.legacy.organizer@example.com").first()
        assert organizer is not None

        legacy_meeting = MeetingORM(
            organizer_id=organizer.id,
            meeting_title="Legacy canonical blocks",
            duration_minutes=30,
            location="Poznan",
            description="Legacy compatibility",
            status="collecting_availability",
            availability_deadline=datetime.now(timezone.utc) + timedelta(days=7),
            proposed_blocks=[
                {"day": "MON", "start_time": "10:00 AM", "end_time": "11:00 AM"},
                {"day": "MON", "start_time": "11:00 AM", "end_time": "12:00 PM"},
            ],
            public_token="legacy-canonical-token",
        )
        db.add(legacy_meeting)
        db.commit()

    join_response = client.get(
        "/meetings/join/legacy-canonical-token",
        headers={"Authorization": f"Bearer {participant_token}"},
    )
    assert join_response.status_code == 200

    payload = join_response.json()
    assert payload["proposed_blocks"]

    for block in payload["proposed_blocks"]:
        assert set(block.keys()) == {"start_time", "end_time"}
        parsed_start = datetime.fromisoformat(block["start_time"].replace("Z", "+00:00"))
        parsed_end = datetime.fromisoformat(block["end_time"].replace("Z", "+00:00"))
        assert parsed_start.tzinfo is not None
        assert parsed_end.tzinfo is not None
        assert parsed_start < parsed_end


def test_submit_participant_availability_subset_with_integration_normalized_blocks(meetings_client):
    client, session_local = meetings_client

    participant_token = _register_and_login(client, "subset.integration@example.com", "secret123")
    expiration = (datetime.now(timezone.utc) + timedelta(days=10)).date().isoformat()

    create_payload = {
        "title": "Integration subset validation",
        "description": "Legacy day/time input",
        "is_draft": False,
        "duration_minutes": 30,
        "location": "Krakow",
        "participants_count": 4,
        "expiration": expiration,
        "auto_venue": False,
        "proposed_blocks": [
            {
                "day": "TUE",
                "start_time": "10:00 AM",
                "end_time": "12:00 PM",
            }
        ],
    }

    create_response = client.post("/api/meetings", json=create_payload)
    assert create_response.status_code == 201
    meeting_id = create_response.json()["meeting_id"]

    with session_local() as db:
        meeting = db.query(MeetingORM).filter(MeetingORM.id == meeting_id).first()
        assert meeting is not None
        public_token = meeting.public_token

    join_response = client.get(
        f"/meetings/join/{public_token}",
        headers={"Authorization": f"Bearer {participant_token}"},
    )
    assert join_response.status_code == 200
    first_proposed = join_response.json()["proposed_blocks"][0]
    proposed_start = datetime.fromisoformat(first_proposed["start_time"].replace("Z", "+00:00"))
    proposed_end = datetime.fromisoformat(first_proposed["end_time"].replace("Z", "+00:00"))

    inside_payload = {
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
    inside_response = client.post(
        f"/meetings/join/{public_token}/availability",
        json=inside_payload,
        headers={"Authorization": f"Bearer {participant_token}"},
    )
    assert inside_response.status_code == 200

    outside_payload = {
        "availability": {
            "available_blocks": [
                {
                    "start_time": proposed_end.isoformat(),
                    "end_time": (proposed_end + timedelta(minutes=15)).isoformat(),
                }
            ],
            "maybe_blocks": [],
        }
    }
    outside_response = client.post(
        f"/meetings/join/{public_token}/availability",
        json=outside_payload,
        headers={"Authorization": f"Bearer {participant_token}"},
    )
    assert outside_response.status_code == 400


def test_submit_participant_availability_rejects_legacy_range_overflow_from_integration_create(meetings_client):
    client, session_local = meetings_client

    participant_token = _register_and_login(client, "legacy.range.boundary@example.com", "secret123")
    expiration = (datetime.now(timezone.utc) + timedelta(days=10)).date().isoformat()

    create_payload = {
        "title": "Legacy range boundary",
        "description": "Ensure exact end-time bounds",
        "is_draft": False,
        "duration_minutes": 30,
        "location": "Wroclaw",
        "participants_count": 4,
        "expiration": expiration,
        "auto_venue": False,
        "proposed_blocks": [
            {
                "day": "TUE",
                "start_time": "10:10 AM",
                "end_time": "10:20 AM",
            }
        ],
    }

    create_response = client.post("/api/meetings", json=create_payload)
    assert create_response.status_code == 201
    meeting_id = create_response.json()["meeting_id"]

    with session_local() as db:
        meeting = db.query(MeetingORM).filter(MeetingORM.id == meeting_id).first()
        assert meeting is not None
        public_token = meeting.public_token

    join_response = client.get(
        f"/meetings/join/{public_token}",
        headers={"Authorization": f"Bearer {participant_token}"},
    )
    assert join_response.status_code == 200

    proposed_block = join_response.json()["proposed_blocks"][0]
    proposed_start = datetime.fromisoformat(proposed_block["start_time"].replace("Z", "+00:00"))
    proposed_end = datetime.fromisoformat(proposed_block["end_time"].replace("Z", "+00:00"))
    assert (proposed_end - proposed_start) == timedelta(minutes=10)

    inside_payload = {
        "availability": {
            "available_blocks": [
                {
                    "start_time": proposed_start.isoformat(),
                    "end_time": proposed_end.isoformat(),
                }
            ],
            "maybe_blocks": [],
        }
    }
    inside_response = client.post(
        f"/meetings/join/{public_token}/availability",
        json=inside_payload,
        headers={"Authorization": f"Bearer {participant_token}"},
    )
    assert inside_response.status_code == 200

    outside_payload = {
        "availability": {
            "available_blocks": [
                {
                    "start_time": proposed_end.isoformat(),
                    "end_time": (proposed_end + timedelta(minutes=5)).isoformat(),
                }
            ],
            "maybe_blocks": [],
        }
    }
    outside_response = client.post(
        f"/meetings/join/{public_token}/availability",
        json=outside_payload,
        headers={"Authorization": f"Bearer {participant_token}"},
    )
    assert outside_response.status_code == 400


def test_submit_participant_availability_subset_with_legacy_day_time_proposed_blocks(meetings_client):
    client, session_local = meetings_client

    organizer_token = _register_and_login(client, "subset.legacy.organizer@example.com", "secret123")
    participant_token = _register_and_login(client, "subset.legacy.participant@example.com", "secret123")

    with session_local() as db:
        organizer = db.query(UserORM).filter(UserORM.email == "subset.legacy.organizer@example.com").first()
        assert organizer is not None

        legacy_meeting = MeetingORM(
            organizer_id=organizer.id,
            meeting_title="Legacy day/time blocks",
            duration_minutes=30,
            location="Poznan",
            description="Legacy compatibility",
            status="collecting_availability",
            availability_deadline=datetime.now(timezone.utc) + timedelta(days=7),
            proposed_blocks=[
                {"day": "MON", "start_time": "10:00 AM", "end_time": "11:00 AM"},
                {"day": "MON", "start_time": "11:00 AM", "end_time": "12:00 PM"},
            ],
            public_token="legacy-subset-token",
        )
        db.add(legacy_meeting)
        db.commit()

    join_response = client.get(
        "/meetings/join/legacy-subset-token",
        headers={"Authorization": f"Bearer {participant_token}"},
    )
    assert join_response.status_code == 200
    join_payload = join_response.json()
    assert len(join_payload["proposed_blocks"]) == 1

    first_proposed = join_payload["proposed_blocks"][0]
    proposed_start = datetime.fromisoformat(first_proposed["start_time"].replace("Z", "+00:00"))
    proposed_end = datetime.fromisoformat(first_proposed["end_time"].replace("Z", "+00:00"))

    inside_payload = {
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
    inside_response = client.post(
        "/meetings/join/legacy-subset-token/availability",
        json=inside_payload,
        headers={"Authorization": f"Bearer {participant_token}"},
    )
    assert inside_response.status_code == 200

    outside_payload = {
        "availability": {
            "available_blocks": [
                {
                    "start_time": proposed_end.isoformat(),
                    "end_time": (proposed_end + timedelta(minutes=15)).isoformat(),
                }
            ],
            "maybe_blocks": [],
        }
    }
    outside_response = client.post(
        "/meetings/join/legacy-subset-token/availability",
        json=outside_payload,
        headers={"Authorization": f"Bearer {participant_token}"},
    )
    assert outside_response.status_code == 400

    with session_local() as db:
        meeting = db.query(MeetingORM).filter(MeetingORM.public_token == "legacy-subset-token").first()
        assert meeting is not None
        participant = db.query(UserORM).filter(UserORM.email == "subset.legacy.participant@example.com").first()
        assert participant is not None
        saved_votes = (
            db.query(ParticipantVoteORM)
            .filter(
                ParticipantVoteORM.meeting_id == meeting.id,
                ParticipantVoteORM.participant_id == participant.id,
            )
            .all()
        )
        assert len(saved_votes) == 1


def test_join_endpoint_requires_authentication(meetings_client):
    client, _ = meetings_client

    organizer_token = _register_and_login(client, "join.auth.organizer@example.com", "secret123")
    start = datetime.now(timezone.utc) + timedelta(minutes=30)
    end = start + timedelta(minutes=45)
    deadline = datetime.now(timezone.utc) + timedelta(minutes=20)

    create_payload = {
        "meeting_title": "Join auth check",
        "duration_minutes": 30,
        "location": "Warszawa",
        "description": "Auth required",
        "proposed_blocks": [{"start_time": start.isoformat(), "end_time": end.isoformat()}],
        "availability_deadline": deadline.isoformat(),
    }

    create_response = client.post(
        "/meetings",
        json=create_payload,
        headers={"Authorization": f"Bearer {organizer_token}"},
    )
    assert create_response.status_code == 201
    public_token = create_response.json()["public_link"].split("/")[-1]

    join_response = client.get(f"/meetings/join/{public_token}")
    assert join_response.status_code == 401


def test_submit_participant_availability_requires_authentication(meetings_client):
    client, _ = meetings_client

    organizer_token = _register_and_login(client, "submit.auth.organizer@example.com", "secret123")
    start = datetime.now(timezone.utc) + timedelta(minutes=30)
    end = start + timedelta(minutes=45)
    deadline = datetime.now(timezone.utc) + timedelta(minutes=20)

    create_payload = {
        "meeting_title": "Submit auth check",
        "duration_minutes": 30,
        "location": "Warszawa",
        "description": "Auth required",
        "proposed_blocks": [{"start_time": start.isoformat(), "end_time": end.isoformat()}],
        "availability_deadline": deadline.isoformat(),
    }

    create_response = client.post(
        "/meetings",
        json=create_payload,
        headers={"Authorization": f"Bearer {organizer_token}"},
    )
    assert create_response.status_code == 201
    public_token = create_response.json()["public_link"].split("/")[-1]

    payload = {
        "availability": {
            "available_blocks": [{"start_time": start.isoformat(), "end_time": end.isoformat()}],
            "maybe_blocks": [],
        }
    }
    submit_response = client.post(f"/meetings/join/{public_token}/availability", json=payload)
    assert submit_response.status_code == 401


