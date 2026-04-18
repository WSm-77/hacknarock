from __future__ import annotations

from datetime import UTC, datetime, timedelta
from pathlib import Path
import secrets
import sys


# Ensure imports from backend/src are available when running as:
# python backend/scripts/seed_deadline_update_test.py
BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from src.auth.service import UserService
from src.database.models import MeetingORM, ParticipantVoteORM, UserORM
from src.database.session import Base, SessionLocal, engine
from src.meetings.service import MeetingService


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


def _create_user(db, idx: int) -> UserORM:
    user = UserORM(
        name=f"DeadlineUser{idx}",
        surname=f"Tester{idx}",
        email=f"deadline_user_{idx}@hacknarock.local",
        hashed_password=UserService.get_password_hash("Password123!"),
        latitude=52.20 + idx * 0.002,
        longitude=21.00 + idx * 0.002,
    )
    db.add(user)
    db.flush()
    return user


def _build_user_blocks(base: datetime, idx: int) -> list[dict[str, str]]:
    # Każdy user ma wiele slotów; 10:00-11:00 jest celowo bardzo popularny.
    blocks = [
        _iso_block(base + timedelta(hours=10), base + timedelta(hours=11)),
        _iso_block(base + timedelta(hours=11), base + timedelta(hours=12)),
    ]

    if idx % 2 == 0:
        blocks.append(_iso_block(base + timedelta(hours=9), base + timedelta(hours=10, minutes=30)))
    else:
        blocks.append(_iso_block(base + timedelta(hours=10, minutes=30), base + timedelta(hours=12, minutes=30)))

    if idx % 3 == 0:
        blocks.append(_iso_block(base + timedelta(hours=8), base + timedelta(hours=9)))

    return blocks


def seed_and_test_deadline_update() -> None:
    _reset_database()

    db = SessionLocal()
    try:
        now = datetime.now(UTC)
        day_anchor = (now - timedelta(days=1)).replace(minute=0, second=0, microsecond=0)

        users = [_create_user(db, i) for i in range(1, 11)]
        organizer = users[0]

        meeting = MeetingORM(
            meeting_title="Deadline Auto Finalization Test",
            description="Seed test dla auto-aktualizacji po deadline.",
            location="Warszawa - Test",
            duration_minutes=60,
            organizer_id=organizer.id,
            status="collecting_availability",
            # Deadline już minął, więc wejście na summary powinno odpalić algorytm.
            availability_deadline=now - timedelta(hours=2),
            proposed_blocks=[
                _iso_block(day_anchor + timedelta(hours=9), day_anchor + timedelta(hours=10)),
                _iso_block(day_anchor + timedelta(hours=10), day_anchor + timedelta(hours=11)),
                _iso_block(day_anchor + timedelta(hours=11), day_anchor + timedelta(hours=12)),
            ],
            choosen_blocks=[],
            public_token=secrets.token_urlsafe(16),
            ai_recommendation=None,
        )
        db.add(meeting)
        db.flush()

        for idx, user in enumerate(users, start=1):
            vote = ParticipantVoteORM(
                meeting_id=meeting.id,
                participant_id=user.id,
                available_blocks=_build_user_blocks(day_anchor, idx),
            )
            db.add(vote)

        db.commit()
        db.refresh(meeting)

        print("Seed test data created.")
        print(f"Meeting ID: {meeting.id}")
        print(f"Status before summary read: {meeting.status}")

        # To wywołanie symuluje wejście na summary po deadline.
        summary = MeetingService.get_meeting_for_organizer(
            db=db,
            meeting_id=meeting.id,
            organizer=organizer,
        )

        db.refresh(meeting)

        print("Summary request executed.")
        print(f"Status after summary read: {meeting.status}")
        print(f"Chosen blocks saved in DB: {meeting.choosen_blocks}")
        print(f"AI recommendation saved in DB: {meeting.ai_recommendation}")
        print(f"Votes count from summary: {summary.votes_count}")

        if meeting.status != "ai_recommended":
            raise RuntimeError("Mechanizm aktualizacji po deadline nie ustawił końcowego statusu.")
        if not meeting.choosen_blocks:
            raise RuntimeError("Mechanizm aktualizacji po deadline nie zapisał choosen_blocks.")

        print("Deadline auto-update test passed.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_and_test_deadline_update()
