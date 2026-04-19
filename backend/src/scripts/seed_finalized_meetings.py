from datetime import datetime, timedelta
import secrets

from src.database.meeting_states import MeetingStatus
from src.database.models import MeetingORM, UserORM
from src.database.session import SessionLocal

SEED_MARKER = "[seed:calendar-finalized]"
SEED_ORGANIZER_EMAIL = "calendar-seed-organizer@local.invalid"


def _resolve_seed_organizer_id() -> str:
    """Return a stable organizer id for seeded calendar meetings."""
    with SessionLocal() as db:
        organizer = db.query(UserORM).filter(UserORM.email == SEED_ORGANIZER_EMAIL).first()
        if organizer is not None:
            return organizer.id

        organizer = UserORM(
            name="Calendar",
            surname="Verifier",
            email=SEED_ORGANIZER_EMAIL,
            hashed_password=secrets.token_urlsafe(24),
        )
        db.add(organizer)
        db.commit()
        db.refresh(organizer)
        return organizer.id


def seed_finalized_meetings() -> None:
    """Create deterministic finalized sample meetings for dashboard calendar verification."""
    organizer_id = _resolve_seed_organizer_id()
    now = datetime.now()

    templates = [
        {
            "title": "Calendar Verification - Product Review",
            "minutes": 45,
            "days_ago": 2,
            "participants": 6,
            "block_start": 9,
        },
        {
            "title": "Calendar Verification - Weekly Sync",
            "minutes": 60,
            "days_ago": 1,
            "participants": 4,
            "block_start": 13,
        },
        {
            "title": "Calendar Verification - Sprint Planning",
            "minutes": 30,
            "days_ago": 0,
            "participants": 8,
            "block_start": 16,
        },
    ]

    with SessionLocal() as db:
        db.query(MeetingORM).filter(MeetingORM.description == SEED_MARKER).delete(synchronize_session=False)

        for template in templates:
            start_time = (now - timedelta(days=template["days_ago"]))\
                .replace(hour=template["block_start"], minute=0, second=0, microsecond=0)
            end_time = start_time + timedelta(minutes=template["minutes"])

            meeting = MeetingORM(
                meeting_title=template["title"],
                duration_minutes=template["minutes"],
                location="Seeded via backend helper",
                organizer_id=organizer_id,
                description=SEED_MARKER,
                is_draft=False,
                status=MeetingStatus.FINALIZED.value,
                created_at=start_time,
                availability_deadline=start_time - timedelta(hours=2),
                proposed_blocks=[
                    {
                        "start_time": start_time.isoformat(),
                        "end_time": end_time.isoformat(),
                    }
                ],
                participants_count=template["participants"],
                auto_find_venue=False,
                venue_recommendations_count=None,
                public_token=secrets.token_urlsafe(16),
                ai_recommendation="Finalized sample for calendar verification.",
            )
            db.add(meeting)

        db.commit()
