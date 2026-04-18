from __future__ import annotations

from datetime import UTC, datetime, timedelta
from pathlib import Path
import secrets
import sys


# Ensure imports from backend/src are available when running as:
# python backend/scripts/seed_db.py
BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from src.auth.service import UserService
from src.database.models import MeetingORM, ParticipantVoteORM, UserORM
from src.database.session import Base, SessionLocal, engine


def _iso_block(start: datetime, end: datetime) -> dict[str, str]:
    return {
        "start_time": start.isoformat(),
        "end_time": end.isoformat(),
    }


def _reset_database() -> None:
    if engine.dialect.name == "postgresql":
        with engine.begin() as connection:
            connection.exec_driver_sql("DROP SCHEMA public CASCADE")
            connection.exec_driver_sql("CREATE SCHEMA public")
        Base.metadata.create_all(bind=engine)
        return

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def _get_or_create_user(
    db,
    *,
    name: str,
    surname: str,
    email: str,
    latitude: float,
    longitude: float,
    password: str = "Password123!",
) -> UserORM:
    user = db.query(UserORM).filter(UserORM.email == email).first()
    if user:
        return user

    user = UserORM(
        name=name,
        surname=surname,
        email=email,
        hashed_password=UserService.get_password_hash(password),
        latitude=latitude,
        longitude=longitude,
    )
    db.add(user)
    db.flush()
    return user


def _create_meeting_with_votes(
    db,
    *,
    title: str,
    description: str,
    location: str,
    duration_minutes: int,
    organizer: UserORM,
    attendees: list[UserORM],
    proposed_blocks: list[dict[str, str]],
) -> MeetingORM:
    now = datetime.now(UTC)
    deadline = now + timedelta(days=2)

    meeting = MeetingORM(
        meeting_title=title,
        description=description,
        location=location,
        duration_minutes=duration_minutes,
        organizer_id=organizer.id,
        status="collecting_availability",
        availability_deadline=deadline,
        proposed_blocks=proposed_blocks,
        public_token=secrets.token_urlsafe(16),
        ai_recommendation=None,
    )
    db.add(meeting)
    db.flush()

    # Każda z 6 osób oddaje głos dostępności dla eventu.
    # Każdy głos zawiera wiele slotów (2-3), zgodnie z definicją listy TimeBlock.
    for idx, person in enumerate(attendees):
        slots_count = min(len(proposed_blocks), 2 + (idx % 2))
        start_at = idx % len(proposed_blocks)
        blocks = [
            proposed_blocks[(start_at + offset) % len(proposed_blocks)]
            for offset in range(slots_count)
        ]
        vote = ParticipantVoteORM(
            meeting_id=meeting.id,
            participant_id=person.id,
            available_blocks=blocks,
        )
        db.add(vote)

    return meeting


def seed_db() -> None:
    _reset_database()

    db = SessionLocal()
    try:
        base_lat, base_lon = 52.2297, 21.0122

        event1_users = [
            _get_or_create_user(
                db,
                name=f"Event1Name{i}",
                surname=f"Event1Surname{i}",
                email=f"event1_user{i}@hacknarock.local",
                latitude=base_lat + i * 0.003,
                longitude=base_lon + i * 0.003,
            )
            for i in range(1, 7)
        ]

        event2_users = [
            _get_or_create_user(
                db,
                name=f"Event2Name{i}",
                surname=f"Event2Surname{i}",
                email=f"event2_user{i}@hacknarock.local",
                latitude=base_lat + 0.05 + i * 0.003,
                longitude=base_lon + 0.05 + i * 0.003,
            )
            for i in range(1, 7)
        ]

        now = datetime.now(UTC)

        event1_blocks = [
            _iso_block(now + timedelta(days=3, hours=17), now + timedelta(days=3, hours=19)),
            _iso_block(now + timedelta(days=4, hours=18), now + timedelta(days=4, hours=20)),
            _iso_block(now + timedelta(days=5, hours=16), now + timedelta(days=5, hours=18)),
        ]

        event2_blocks = [
            _iso_block(now + timedelta(days=6, hours=9), now + timedelta(days=6, hours=11)),
            _iso_block(now + timedelta(days=7, hours=10), now + timedelta(days=7, hours=12)),
            _iso_block(now + timedelta(days=8, hours=14), now + timedelta(days=8, hours=16)),
        ]

        meeting1 = _create_meeting_with_votes(
            db,
            title="HackNaRock Planning Session",
            description="Planowanie demo i podział zadań zespołu.",
            location="Warszawa - Centrum",
            duration_minutes=120,
            organizer=event1_users[0],
            attendees=event1_users,
            proposed_blocks=event1_blocks,
        )

        meeting2 = _create_meeting_with_votes(
            db,
            title="HackNaRock Retrospective",
            description="Retrospektywa po zakończeniu sprintu.",
            location="Warszawa - Mokotów",
            duration_minutes=120,
            organizer=event2_users[0],
            attendees=event2_users,
            proposed_blocks=event2_blocks,
        )

        db.commit()

        print("Seed completed.")
        print(f"Created/used users: {len(event1_users) + len(event2_users)}")
        print(f"Created meetings: {meeting1.id}, {meeting2.id}")
        print("Each meeting has 6 participant votes.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_db()
