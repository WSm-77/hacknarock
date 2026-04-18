import sys
from datetime import datetime, timedelta
from pathlib import Path
from uuid import UUID

import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

sys.path.append(str(Path(__file__).resolve().parents[1]))

from src.auth.service import UserService
from src.database.meeting_states import MeetingStatus as DbMeetingStatus
from src.database.models import MeetingORM, ParticipantVoteORM, UserORM
from src.database.session import Base
from src.meetings.common import ParticipantAvailability, TimeBlock
from src.meetings.service import MeetingService


@pytest.fixture()
def db_session(tmp_path) -> Session:
    db_path = tmp_path / "test_meeting_deadline_algorithm.db"
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    testing_session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    Base.metadata.create_all(bind=engine)

    session = testing_session_local()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def _mk_block(start: datetime, end: datetime) -> dict[str, str]:
    return {
        "start_time": start.isoformat(),
        "end_time": end.isoformat(),
    }


def _create_user(db: Session, idx: int) -> UserORM:
    user = UserORM(
        name=f"User{idx}",
        surname="Deadline",
        email=f"user{idx}@example.com",
        hashed_password=UserService.get_password_hash("secret123"),
    )
    db.add(user)
    db.flush()
    return user


def _create_meeting_with_votes(db: Session, *, deadline: datetime) -> tuple[MeetingORM, UserORM]:
    organizer = _create_user(db, 0)
    users = [_create_user(db, idx) for idx in range(1, 6)]

    base_day = datetime(2026, 4, 20, 0, 0, 0)

    meeting = MeetingORM(
        meeting_title="Deadline algorithm test",
        description="Unit test for deadline-triggered greedy selection.",
        location="Warsaw",
        duration_minutes=60,
        organizer_id=organizer.id,
        status=DbMeetingStatus.COLLECTING_AVAILABILITY.value,
        availability_deadline=deadline,
        proposed_blocks=[
            _mk_block(base_day.replace(hour=9), base_day.replace(hour=10)),
            _mk_block(base_day.replace(hour=10), base_day.replace(hour=11)),
        ],
        choosen_blocks=[],
        public_token="test-token-deadline-algo",
        ai_recommendation=None,
    )
    db.add(meeting)
    db.flush()

    votes_payload = [
        [_mk_block(base_day.replace(hour=9), base_day.replace(hour=11)), _mk_block(base_day.replace(hour=12), base_day.replace(hour=13))],
        [_mk_block(base_day.replace(hour=9), base_day.replace(hour=10)), _mk_block(base_day.replace(hour=10), base_day.replace(hour=11))],
        [_mk_block(base_day.replace(hour=9, minute=30), base_day.replace(hour=11)), _mk_block(base_day.replace(hour=13), base_day.replace(hour=14))],
        [_mk_block(base_day.replace(hour=8), base_day.replace(hour=10)), _mk_block(base_day.replace(hour=9), base_day.replace(hour=11))],
        [_mk_block(base_day.replace(hour=9, minute=30), base_day.replace(hour=11, minute=30)), _mk_block(base_day.replace(hour=15), base_day.replace(hour=16))],
    ]

    for user, blocks in zip(users, votes_payload, strict=True):
        vote = ParticipantVoteORM(
            meeting_id=meeting.id,
            participant_id=user.id,
            available_blocks=blocks,
        )
        db.add(vote)

    db.commit()
    db.refresh(meeting)
    return meeting, organizer


def _create_meeting_with_custom_votes(
    db: Session,
    *,
    deadline: datetime,
    duration_minutes: int,
    votes_payload: list[list[dict[str, str]]],
) -> tuple[MeetingORM, UserORM, list[UserORM]]:
    organizer = _create_user(db, 100)
    users = [_create_user(db, idx) for idx in range(101, 101 + len(votes_payload))]

    base_day = datetime(2026, 5, 1, 0, 0, 0)
    meeting = MeetingORM(
        meeting_title="Deadline custom test",
        description="Custom payload test",
        location="Warsaw",
        duration_minutes=duration_minutes,
        organizer_id=organizer.id,
        status=DbMeetingStatus.COLLECTING_AVAILABILITY.value,
        availability_deadline=deadline,
        proposed_blocks=[
            _mk_block(base_day.replace(hour=9), base_day.replace(hour=10)),
            _mk_block(base_day.replace(hour=10), base_day.replace(hour=11)),
            _mk_block(base_day.replace(hour=11), base_day.replace(hour=12)),
        ],
        choosen_blocks=[],
        public_token=f"test-token-{organizer.id}",
        ai_recommendation=None,
    )
    db.add(meeting)
    db.flush()

    for user, blocks in zip(users, votes_payload, strict=True):
        db.add(
            ParticipantVoteORM(
                meeting_id=meeting.id,
                participant_id=user.id,
                available_blocks=blocks,
            )
        )

    db.commit()
    db.refresh(meeting)
    return meeting, organizer, users


def _parse_iso(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def test_summary_after_short_deadline_triggers_algorithm_and_finalizes(db_session: Session) -> None:
    deadline = datetime.utcnow() - timedelta(seconds=5)
    meeting, organizer = _create_meeting_with_votes(db_session, deadline=deadline)

    response = MeetingService.get_meeting_for_organizer(
        db=db_session,
        meeting_id=UUID(meeting.id),
        organizer=organizer,
    )

    db_session.refresh(meeting)

    assert response.votes_count == 5
    assert meeting.status == DbMeetingStatus.AI_RECOMMENDED.value
    assert len(meeting.choosen_blocks) == 1

    chosen = meeting.choosen_blocks[0]
    chosen_start = _parse_iso(chosen["start_time"])
    chosen_end = _parse_iso(chosen["end_time"])

    # Dla remisu i wielu pasujących przedziałów wybieramy najwcześniejszy, a następnie przycinamy do duration=60.
    assert chosen_start.hour == 9 and chosen_start.minute == 30
    assert chosen_end.hour == 10 and chosen_end.minute == 30


def test_summary_before_deadline_does_not_trigger_algorithm(db_session: Session) -> None:
    deadline = datetime.utcnow() + timedelta(minutes=2)
    meeting, organizer = _create_meeting_with_votes(db_session, deadline=deadline)

    response = MeetingService.get_meeting_for_organizer(
        db=db_session,
        meeting_id=UUID(meeting.id),
        organizer=organizer,
    )

    db_session.refresh(meeting)

    assert response.votes_count == 5
    assert meeting.status == DbMeetingStatus.COLLECTING_AVAILABILITY.value
    assert meeting.choosen_blocks == []


def test_tie_returns_only_earliest_interval() -> None:
    base_day = datetime(2026, 4, 20, 0, 0, 0)

    votes = [
        ParticipantVoteORM(
            meeting_id="m1",
            participant_id="u1",
            available_blocks=[
                _mk_block(base_day.replace(hour=9), base_day.replace(hour=10)),
                _mk_block(base_day.replace(hour=13), base_day.replace(hour=14)),
            ],
        ),
        ParticipantVoteORM(
            meeting_id="m1",
            participant_id="u2",
            available_blocks=[
                _mk_block(base_day.replace(hour=9), base_day.replace(hour=10)),
                _mk_block(base_day.replace(hour=13), base_day.replace(hour=14)),
            ],
        ),
    ]

    best = MeetingService._select_best_continuous_interval(votes)

    assert best is not None
    best_start, best_end, best_votes = best
    assert best_votes == 2
    assert best_start.hour == 9 and best_start.minute == 0
    assert best_end.hour == 10 and best_end.minute == 0


def test_trigger_before_deadline_raises_409(db_session: Session) -> None:
    deadline = datetime.utcnow() + timedelta(minutes=5)
    meeting, organizer = _create_meeting_with_votes(db_session, deadline=deadline)

    with pytest.raises(HTTPException) as exc_info:
        MeetingService.trigger_ai_recommendation(
            db=db_session,
            meeting_id=UUID(meeting.id),
            organizer=organizer,
        )

    assert exc_info.value.status_code == 409


def test_trigger_after_deadline_is_idempotent(db_session: Session) -> None:
    deadline = datetime.utcnow() - timedelta(seconds=10)
    meeting, organizer = _create_meeting_with_votes(db_session, deadline=deadline)

    first = MeetingService.trigger_ai_recommendation(
        db=db_session,
        meeting_id=UUID(meeting.id),
        organizer=organizer,
    )
    db_session.refresh(meeting)
    chosen_after_first = list(meeting.choosen_blocks)

    second = MeetingService.trigger_ai_recommendation(
        db=db_session,
        meeting_id=UUID(meeting.id),
        organizer=organizer,
    )
    db_session.refresh(meeting)

    assert first.status.value == DbMeetingStatus.AI_RECOMMENDED.value
    assert second.status.value == DbMeetingStatus.AI_RECOMMENDED.value
    assert meeting.status == DbMeetingStatus.AI_RECOMMENDED.value
    assert meeting.choosen_blocks == chosen_after_first


def test_duration_fallback_keeps_shorter_interval(db_session: Session) -> None:
    base_day = datetime(2026, 5, 1, 0, 0, 0)
    votes_payload = [
        [_mk_block(base_day.replace(hour=9), base_day.replace(hour=10))],
        [_mk_block(base_day.replace(hour=9), base_day.replace(hour=10))],
        [_mk_block(base_day.replace(hour=9), base_day.replace(hour=10))],
    ]
    meeting, organizer, users = _create_meeting_with_custom_votes(
        db_session,
        deadline=datetime.utcnow() - timedelta(seconds=1),
        duration_minutes=180,
        votes_payload=votes_payload,
    )

    with pytest.raises(HTTPException) as exc_info:
        MeetingService.submit_participant_availability(
            db=db_session,
            public_token=meeting.public_token,
            participant=users[0],
            availability=ParticipantAvailability(
                available_blocks=[
                    TimeBlock(
                        start_time=base_day.replace(hour=10),
                        end_time=base_day.replace(hour=11),
                    )
                ]
            ),
        )

    assert exc_info.value.status_code == 409
    db_session.refresh(meeting)

    assert meeting.status == DbMeetingStatus.AI_RECOMMENDED.value
    assert len(meeting.choosen_blocks) == 1

    chosen = meeting.choosen_blocks[0]
    chosen_start = _parse_iso(chosen["start_time"])
    chosen_end = _parse_iso(chosen["end_time"])

    # Requested duration is 180, but only 60-minute interval is available.
    assert chosen_start.hour == 9 and chosen_start.minute == 0
    assert chosen_end.hour == 10 and chosen_end.minute == 0
