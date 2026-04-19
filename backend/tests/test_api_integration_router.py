import sys
from pathlib import Path
from uuid import uuid4

from fastapi.testclient import TestClient

sys.path.append(str(Path(__file__).resolve().parents[1]))

from main import _get_cors_origins, app
from src.api_integration.models import CreateMeetingRequestDTO
from src.api_integration.service import integration_store


def test_dashboard_is_available():
    """Dashboard endpoint should return lightweight integration payload."""
    client = TestClient(app)

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


def test_dashboard_polls_include_waiting_for_acceptance_and_exclude_draft() -> None:
    """Dashboard polls should include active poll states and omit draft meetings."""
    client = TestClient(app)

    waiting = integration_store.create_meeting(CreateMeetingRequestDTO(title="Waiting poll"))
    draft = integration_store.create_meeting(CreateMeetingRequestDTO(title="Draft poll"))

    waiting_id = waiting.meeting_id
    draft_id = draft.meeting_id
    waiting_poll_id = waiting.poll_id
    draft_poll_id = draft.poll_id

    try:
        with integration_store._lock:
            integration_store._meetings[str(waiting_id)]["status"] = "waiting_for_acceptance"
            integration_store._meetings[str(draft_id)]["status"] = "draft"

        response = client.get("/api/dashboard")

        assert response.status_code == 200
        payload = response.json()
        polls = payload["polls"]

        waiting_poll = next((poll for poll in polls if poll["meeting_id"] == str(waiting_id)), None)
        assert waiting_poll is not None
        assert waiting_poll["status"] == "waiting_for_acceptance"

        draft_poll = next((poll for poll in polls if poll["meeting_id"] == str(draft_id)), None)
        assert draft_poll is None
    finally:
        with integration_store._lock:
            integration_store._meetings.pop(str(waiting_id), None)
            integration_store._meetings.pop(str(draft_id), None)
            integration_store._polls.pop(str(waiting_poll_id), None)
            integration_store._polls.pop(str(draft_poll_id), None)


def test_dashboard_calendar_meetings_include_waiting_for_acceptance_and_exclude_draft() -> None:
    """Calendar meetings should include waiting states and filter out drafts."""
    client = TestClient(app)

    waiting = integration_store.create_meeting(CreateMeetingRequestDTO(title="Waiting calendar", duration_minutes=90))
    draft = integration_store.create_meeting(CreateMeetingRequestDTO(title="Draft calendar"))

    waiting_id = waiting.meeting_id
    draft_id = draft.meeting_id
    waiting_poll_id = waiting.poll_id
    draft_poll_id = draft.poll_id

    try:
        with integration_store._lock:
            integration_store._meetings[str(waiting_id)]["status"] = "waiting_for_acceptance"
            integration_store._meetings[str(draft_id)]["status"] = "draft"

        response = client.get("/api/dashboard")

        assert response.status_code == 200
        payload = response.json()
        calendar_meetings = payload["calendar_meetings"]

        waiting_calendar = next(
            (meeting for meeting in calendar_meetings if meeting["meeting_id"] == str(waiting_id)),
            None,
        )
        assert waiting_calendar is not None
        assert waiting_calendar["status"] == "waiting_for_acceptance"
        assert set(waiting_calendar.keys()) == {"meeting_id", "title", "status", "start_at", "end_at"}
        assert waiting_calendar["start_at"] < waiting_calendar["end_at"]

        draft_calendar = next(
            (meeting for meeting in calendar_meetings if meeting["meeting_id"] == str(draft_id)),
            None,
        )
        assert draft_calendar is None
    finally:
        with integration_store._lock:
            integration_store._meetings.pop(str(waiting_id), None)
            integration_store._meetings.pop(str(draft_id), None)
            integration_store._polls.pop(str(waiting_poll_id), None)
            integration_store._polls.pop(str(draft_poll_id), None)


def test_dashboard_polls_contract_contains_expected_fields() -> None:
    """Dashboard poll entries should keep a stable contract for frontend mapping."""
    client = TestClient(app)

    created = integration_store.create_meeting(CreateMeetingRequestDTO(title="Poll contract"))
    meeting_id = created.meeting_id
    poll_id = created.poll_id

    try:
        response = client.get("/api/dashboard")

        assert response.status_code == 200
        payload = response.json()
        poll_entry = next((poll for poll in payload["polls"] if poll["meeting_id"] == str(meeting_id)), None)

        assert poll_entry is not None
        assert set(poll_entry.keys()) == {
            "meeting_id",
            "poll_id",
            "title",
            "status",
            "participants",
            "created_at",
        }
        assert poll_entry["poll_id"] == str(poll_id)
    finally:
        with integration_store._lock:
            integration_store._meetings.pop(str(meeting_id), None)
            integration_store._polls.pop(str(poll_id), None)


def test_meeting_creation_poll_fetch_and_voting_flow():
    """Creates meeting, fetches poll and stores votes for a basic happy path."""
    client = TestClient(app)

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


def test_poll_not_found_returns_404():
    """Unknown poll identifiers should be handled as 404 responses."""
    client = TestClient(app)

    response = client.get(f"/api/polls/{uuid4()}")

    assert response.status_code == 404


def test_poll_id_must_be_uuid() -> None:
    """Malformed poll identifiers should be rejected at validation layer."""
    client = TestClient(app)

    response = client.get("/api/polls/not-a-uuid")

    assert response.status_code == 422


def test_create_meeting_rejects_extra_fields() -> None:
    """Unexpected request fields should be rejected to avoid mass assignment issues."""
    client = TestClient(app)

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


def test_create_meeting_returns_429_when_capacity_reached(monkeypatch) -> None:
    """Meeting creation should fail with 429 once store capacity limits are hit."""
    client = TestClient(app)

    monkeypatch.setattr(integration_store, "MAX_MEETINGS", 0)

    response = client.post(
        "/api/meetings",
        json={
            "title": "Capacity lock",
            "description": "Validation test",
            "organizer_name": "Wiktor",
        },
    )

    assert response.status_code == 429
    assert response.json()["detail"] == "Integration store capacity reached"


def test_vote_rejects_invalid_option_id_format() -> None:
    """Option IDs containing unsafe characters should be rejected."""
    client = TestClient(app)

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


def test_vote_rejects_unknown_option() -> None:
    """Unknown but well-formed option IDs should return domain-level validation error."""
    client = TestClient(app)

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


def test_vote_returns_404_for_unknown_poll() -> None:
    """Voting against a non-existent poll should return 404."""
    client = TestClient(app)

    response = client.post(
        f"/api/polls/{uuid4()}/votes",
        json={"option_id": "option-a", "voter_id": "alice"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Poll not found"


def test_vote_rejects_new_voters_after_capacity(monkeypatch) -> None:
    """The in-memory poll should stop accepting unlimited distinct voters."""
    client = TestClient(app)

    monkeypatch.setattr(integration_store, "MAX_VOTERS_PER_POLL", 2)

    create_response = client.post(
        "/api/meetings",
        json={
            "title": "Capacity test",
            "description": "Abuse guard",
            "organizer_name": "Wiktor",
        },
    )
    poll_id = create_response.json()["poll_id"]

    poll_response = client.get(f"/api/polls/{poll_id}")
    option_id = poll_response.json()["options"][0]["option_id"]

    first_vote = client.post(
        f"/api/polls/{poll_id}/votes",
        json={"option_id": option_id, "voter_id": "voter-1"},
    )
    second_vote = client.post(
        f"/api/polls/{poll_id}/votes",
        json={"option_id": option_id, "voter_id": "voter-2"},
    )
    blocked_vote = client.post(
        f"/api/polls/{poll_id}/votes",
        json={"option_id": option_id, "voter_id": "voter-3"},
    )

    assert first_vote.status_code == 200
    assert second_vote.status_code == 200
    assert blocked_vote.status_code == 429


def test_vote_anonymous_voters_respect_capacity(monkeypatch) -> None:
    """Anonymous votes should still be bounded by per-poll voter capacity."""
    client = TestClient(app)

    monkeypatch.setattr(integration_store, "MAX_VOTERS_PER_POLL", 2)

    create_response = client.post(
        "/api/meetings",
        json={
            "title": "Anonymous capacity",
            "description": "Abuse guard",
            "organizer_name": "Wiktor",
        },
    )
    poll_id = create_response.json()["poll_id"]

    poll_response = client.get(f"/api/polls/{poll_id}")
    option_id = poll_response.json()["options"][0]["option_id"]

    first_vote = client.post(
        f"/api/polls/{poll_id}/votes",
        json={"option_id": option_id},
    )
    second_vote = client.post(
        f"/api/polls/{poll_id}/votes",
        json={"option_id": option_id},
    )
    blocked_vote = client.post(
        f"/api/polls/{poll_id}/votes",
        json={"option_id": option_id},
    )

    assert first_vote.status_code == 200
    assert second_vote.status_code == 200
    assert blocked_vote.status_code == 429


def test_vote_allows_existing_voter_to_change_choice_when_capacity_reached(monkeypatch) -> None:
    """Existing voters should be able to update their vote even after voter capacity is reached."""
    client = TestClient(app)

    monkeypatch.setattr(integration_store, "MAX_VOTERS_PER_POLL", 1)

    create_response = client.post(
        "/api/meetings",
        json={
            "title": "Vote update at capacity",
            "description": "Constraint check",
            "organizer_name": "Wiktor",
        },
    )
    poll_id = create_response.json()["poll_id"]

    poll_response = client.get(f"/api/polls/{poll_id}")
    option_a = poll_response.json()["options"][0]["option_id"]
    option_b = poll_response.json()["options"][1]["option_id"]

    first_vote = client.post(
        f"/api/polls/{poll_id}/votes",
        json={"option_id": option_a, "voter_id": "voter-1"},
    )
    updated_vote = client.post(
        f"/api/polls/{poll_id}/votes",
        json={"option_id": option_b, "voter_id": "voter-1"},
    )
    blocked_new_voter = client.post(
        f"/api/polls/{poll_id}/votes",
        json={"option_id": option_b, "voter_id": "voter-2"},
    )

    assert first_vote.status_code == 200
    assert updated_vote.status_code == 200
    assert updated_vote.json()["total_votes"] == 1
    assert blocked_new_voter.status_code == 429


def test_create_meeting_rejects_too_many_proposed_blocks() -> None:
    """Large proposed_blocks payloads should be rejected to limit resource abuse."""
    client = TestClient(app)

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
    """CORS parser should reject wildcard and malformed origins when credentials are enabled."""
    monkeypatch.setenv(
        "FRONTEND_CORS_ORIGINS",
        "*, javascript:alert(1), https://example.com, http://localhost:5173",
    )

    origins = _get_cors_origins()

    assert "*" not in origins
    assert "javascript:alert(1)" not in origins
    assert "https://example.com" in origins
    assert "http://localhost:5173" in origins
