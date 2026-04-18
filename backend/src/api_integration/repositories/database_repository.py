from datetime import UTC, datetime, time, timedelta
from collections import defaultdict
import secrets
from uuid import UUID

from sqlalchemy.orm import Session

from ...database.meeting_states import MeetingStatus
from ...database.models import MeetingORM, UserORM
from ..models import CreateMeetingRequestDTO, CreateMeetingResponseDTO


class IntegrationDatabaseRepository:
    """Database-backed repository used by integration create endpoint."""

    def __init__(self, db: Session) -> None:
        self._db = db

    def _resolve_organizer_id(self) -> str:
        organizer = self._db.query(UserORM).first()
        if organizer:
            return organizer.id

        suffix = secrets.token_hex(4)
        fallback = UserORM(
            name=f"Integration-{suffix}",
            surname=f"Organizer-{suffix}",
            email=f"integration-organizer-{suffix}@local.invalid",
            hashed_password=secrets.token_urlsafe(24),
        )
        self._db.add(fallback)
        self._db.flush()
        return fallback.id

    @staticmethod
    def _resolve_deadline(payload: CreateMeetingRequestDTO) -> datetime:
        if payload.expiration is not None:
            # Expiration from create page is a date; keep it valid through end of selected day.
            return datetime.combine(payload.expiration, time(23, 59, 59), tzinfo=UTC)

        return datetime.now(UTC) + timedelta(days=7)

    @staticmethod
    def _parse_time_label_to_minutes(label: str) -> int | None:
        candidate = label.strip()
        # Accept both "11:15 AM" and "11:15AM"
        for fmt in ("%I:%M %p", "%I:%M%p"):
            try:
                parsed = datetime.strptime(candidate, fmt)
                return parsed.hour * 60 + parsed.minute
            except ValueError:
                continue
        return None

    @staticmethod
    def _format_minutes_to_label(total_minutes: int) -> str:
        wrapped = total_minutes % (24 * 60)
        dt = datetime(2000, 1, 1) + timedelta(minutes=wrapped)
        return dt.strftime("%I:%M %p").lstrip("0")

    @classmethod
    def _compact_proposed_blocks(cls, raw_blocks: list[dict[str, str]]) -> list[dict[str, str]]:
        day_order = {"MON": 0, "TUE": 1, "WED": 2, "THU": 3, "FRI": 4, "SAT": 5, "SUN": 6}
        slots_by_day: dict[str, set[int]] = defaultdict(set)

        for block in raw_blocks:
            day = str(block.get("day", "")).strip().upper()
            if not day:
                continue

            # Support point-slot format: {day, time}
            label = str(block.get("time", "")).strip()
            if label:
                minutes = cls._parse_time_label_to_minutes(label)
                if minutes is not None:
                    slots_by_day[day].add(minutes)
                continue

            # Support compact range format: {day, start_time, end_time}
            start_label = str(block.get("start_time", "")).strip()
            end_label = str(block.get("end_time", "")).strip()
            if not start_label or not end_label:
                continue

            start_minutes = cls._parse_time_label_to_minutes(start_label)
            end_minutes = cls._parse_time_label_to_minutes(end_label)
            if start_minutes is None or end_minutes is None or end_minutes <= start_minutes:
                continue

            # Expand to 15-minute slots for canonical merge logic.
            minute = start_minutes
            while minute < end_minutes:
                slots_by_day[day].add(minute)
                minute += 15

        compacted: list[dict[str, str]] = []
        for day in sorted(slots_by_day.keys(), key=lambda d: day_order.get(d, 999)):
            ordered = sorted(slots_by_day[day])
            if not ordered:
                continue

            start = ordered[0]
            prev = ordered[0]
            for minute in ordered[1:]:
                if minute == prev + 15:
                    prev = minute
                    continue

                compacted.append(
                    {
                        "day": day,
                        "start_time": cls._format_minutes_to_label(start),
                        "end_time": cls._format_minutes_to_label(prev + 15),
                    }
                )
                start = minute
                prev = minute

            compacted.append(
                {
                    "day": day,
                    "start_time": cls._format_minutes_to_label(start),
                    "end_time": cls._format_minutes_to_label(prev + 15),
                }
            )

        return compacted

    def create_meeting(self, payload: CreateMeetingRequestDTO) -> CreateMeetingResponseDTO:
        deadline = self._resolve_deadline(payload)
        now = datetime.now(UTC)
        if deadline <= now:
            raise ValueError("expiration must be in the future")

        venue_recommendations_count = (
            payload.venue_recommendations_count if payload.auto_venue else None
        )
        compacted_blocks = self._compact_proposed_blocks(payload.proposed_blocks)

        meeting = MeetingORM(
            meeting_title=payload.title,
            duration_minutes=payload.duration_minutes,
            location=(payload.location or "").strip(),
            organizer_id=self._resolve_organizer_id(),
            description=payload.description,
            is_draft=payload.is_draft,
            status=MeetingStatus.COLLECTING_AVAILABILITY.value,
            availability_deadline=deadline,
            proposed_blocks=compacted_blocks,
            participants_count=payload.participants_count,
            auto_find_venue=payload.auto_venue,
            venue_recommendations_count=venue_recommendations_count,
            public_token=secrets.token_urlsafe(24),
        )

        self._db.add(meeting)
        self._db.commit()
        self._db.refresh(meeting)

        # Frontend currently uses poll_id for redirect; use meeting id as stable id for now.
        meeting_uuid = UUID(meeting.id)
        return CreateMeetingResponseDTO(
            meeting_id=meeting_uuid,
            poll_id=meeting_uuid,
            status="created",
            message="Meeting created.",
        )
