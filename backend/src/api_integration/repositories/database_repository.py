from datetime import UTC, date, datetime, time, timedelta
from collections import defaultdict
import secrets
from uuid import UUID

from sqlalchemy.orm import Session

from ...database.meeting_states import MeetingStatus
from ...database.models import MeetingORM, ParticipantVoteORM, UserORM
from ..models import (
    CreateMeetingRequestDTO,
    CreateMeetingResponseDTO,
    DashboardCalendarMeetingDTO,
    DashboardMeetingDTO,
    DashboardPollDTO,
    DashboardResponseDTO,
    PollOptionDTO,
    PollResponseDTO,
    VoteResponseDTO,
)


class IntegrationDatabaseRepository:
    """Database-backed repository used by integration endpoints."""

    DEFAULT_POLL_OPTIONS = (
        ("option-a", "Option A"),
        ("option-b", "Option B"),
        ("option-c", "Option C"),
    )
    KNOWN_DASHBOARD_STATUSES = frozenset(
        {
            "draft",
            "collecting_votes",
            "collecting_availability",
            "waiting_for_acceptance",
            "confirmed",
            "scheduled",
            "closed",
            "finalized",
            "ready_for_ai",
            "ai_recommended",
        }
    )

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
        """Resolve integration meeting deadline from payload with fallback policy.

        Args:
            payload: Integration create request DTO.

        Returns:
            datetime: UTC deadline at end of selected expiration day or default future date.
        """
        if payload.expiration is not None:
            # Expiration from create page is a date; keep it valid through end of selected day.
            return datetime.combine(payload.expiration, time(23, 59, 59), tzinfo=UTC)

        return datetime.now(UTC) + timedelta(days=7)

    @staticmethod
    def _parse_time_label_to_minutes(label: str) -> int | None:
        """Parse a 12-hour time label into minutes since midnight.

        Args:
            label: Time label such as "11:15 AM" or "11:15AM".

        Returns:
            int | None: Minutes since midnight when parsing succeeds; otherwise None.
        """
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

    @staticmethod
    def _parse_iso_datetime(raw: object) -> datetime | None:
        """Parse an ISO datetime value and normalize it to UTC.

        Args:
            raw: Raw candidate value expected to contain an ISO datetime string.

        Returns:
            datetime | None: UTC datetime for valid ISO input; otherwise None.
        """
        if not isinstance(raw, str):
            return None
        candidate = raw.strip()
        if not candidate:
            return None

        try:
            parsed = datetime.fromisoformat(candidate.replace("Z", "+00:00"))
        except ValueError:
            return None

        if parsed.tzinfo is None:
            return parsed.replace(tzinfo=UTC)
        return parsed.astimezone(UTC)

    @staticmethod
    def _resolve_anchor_monday(deadline: datetime) -> date:
        """Resolve Monday date anchor for mapping day-based blocks.

        Args:
            deadline: Meeting deadline used to determine target calendar week.

        Returns:
            date: Monday date for the deadline week in UTC.
        """
        deadline_utc = deadline if deadline.tzinfo else deadline.replace(tzinfo=UTC)
        deadline_utc = deadline_utc.astimezone(UTC)
        anchor = deadline_utc.date()
        return anchor - timedelta(days=anchor.weekday())

    @classmethod
    def _merge_ranges(cls, ranges: list[tuple[datetime, datetime]]) -> list[dict[str, str]]:
        """Merge overlapping or adjacent datetime ranges into canonical blocks.

        Args:
            ranges: Raw datetime intervals to merge.

        Returns:
            list[dict[str, str]]: Canonical blocks with start_time and end_time ISO strings.
        """
        if not ranges:
            return []

        ordered = sorted(ranges, key=lambda item: item[0])
        merged: list[list[datetime]] = [[ordered[0][0], ordered[0][1]]]
        for start, end in ordered[1:]:
            current = merged[-1]
            if start <= current[1]:
                if end > current[1]:
                    current[1] = end
                continue
            merged.append([start, end])

        return [
            {
                "start_time": start.isoformat(),
                "end_time": end.isoformat(),
            }
            for start, end in merged
        ]

    @classmethod
    def _compact_proposed_blocks(
        cls,
        raw_blocks: list[dict[str, str]],
        *,
        anchor_monday: date,
    ) -> list[dict[str, str]]:
        """Normalize mixed integration proposed blocks into canonical UTC ranges.

        Supports canonical ISO ranges, point-slot day/time format, and legacy
        day/start_time/end_time labels before producing merged canonical ranges.

        Args:
            raw_blocks: Organizer-provided proposed blocks from integration payload.
            anchor_monday: Week anchor used when converting day-based legacy blocks.

        Returns:
            list[dict[str, str]]: Canonical blocks with start_time and end_time ISO strings.
        """
        day_order = {"MON": 0, "TUE": 1, "WED": 2, "THU": 3, "FRI": 4, "SAT": 5, "SUN": 6}
        slots_by_day: dict[str, set[int]] = defaultdict(set)
        ranges: list[tuple[datetime, datetime]] = []

        for block in raw_blocks:
            # Prefer already-canonical datetime ranges when provided.
            start_dt = cls._parse_iso_datetime(block.get("start_time"))
            end_dt = cls._parse_iso_datetime(block.get("end_time"))
            if start_dt and end_dt and end_dt > start_dt:
                ranges.append((start_dt, end_dt))
                continue

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

            day_index = day_order.get(day)
            if day_index is None:
                continue

            day_date = anchor_monday + timedelta(days=day_index)
            range_start = datetime.combine(day_date, time.min, tzinfo=UTC) + timedelta(minutes=start_minutes)
            range_end = datetime.combine(day_date, time.min, tzinfo=UTC) + timedelta(minutes=end_minutes)
            ranges.append((range_start, range_end))

        compacted: list[tuple[datetime, datetime]] = []
        for day in sorted(slots_by_day.keys(), key=lambda d: day_order.get(d, 999)):
            ordered = sorted(slots_by_day[day])
            if not ordered:
                continue

            day_index = day_order.get(day)
            if day_index is None:
                continue
            day_date = anchor_monday + timedelta(days=day_index)

            start = ordered[0]
            prev = ordered[0]
            for minute in ordered[1:]:
                if minute == prev + 15:
                    prev = minute
                    continue

                slot_start = datetime.combine(day_date, time.min, tzinfo=UTC) + timedelta(minutes=start)
                slot_end = datetime.combine(day_date, time.min, tzinfo=UTC) + timedelta(minutes=prev + 15)
                compacted.append((slot_start, slot_end))
                start = minute
                prev = minute

            slot_start = datetime.combine(day_date, time.min, tzinfo=UTC) + timedelta(minutes=start)
            slot_end = datetime.combine(day_date, time.min, tzinfo=UTC) + timedelta(minutes=prev + 15)
            compacted.append((slot_start, slot_end))

        ranges.extend(compacted)
        return cls._merge_ranges(ranges)

    def create_meeting(self, payload: CreateMeetingRequestDTO) -> CreateMeetingResponseDTO:
        """Create an integration meeting with canonicalized proposed blocks.

        Args:
            payload: Integration create request DTO.

        Returns:
            CreateMeetingResponseDTO: Persisted identifiers and creation status payload.

        Raises:
            ValueError: Raised when resolved expiration is not in the future.
        """
        deadline = self._resolve_deadline(payload)
        now = datetime.now(UTC)
        if deadline <= now:
            raise ValueError("expiration must be in the future")

        venue_recommendations_count = (
            payload.venue_recommendations_count if payload.auto_venue else None
        )
        anchor_monday = self._resolve_anchor_monday(deadline)
        compacted_blocks = self._compact_proposed_blocks(
            payload.proposed_blocks,
            anchor_monday=anchor_monday,
        )

        meeting = MeetingORM(
            meeting_title=payload.title,
            duration_minutes=payload.duration_minutes,
            location=(payload.location or "").strip(),
            organizer_id=self._resolve_organizer_id(),
            description=payload.description,
            is_draft=payload.is_draft,
            # Preserve the integration API contract during DB cutover.
            status="collecting_votes",
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

    def get_poll(self, poll_id: UUID) -> PollResponseDTO:
        meeting = self._db.query(MeetingORM).filter(MeetingORM.id == str(poll_id)).first()
        if meeting is None:
            raise KeyError("poll_not_found")

        options = self._build_poll_options(meeting)
        votes_by_option = self._collect_votes_by_option(meeting_id=meeting.id, option_ids={option.option_id for option in options})
        hydrated_options = [
            PollOptionDTO(option_id=option.option_id, label=option.label, votes=votes_by_option.get(option.option_id, 0))
            for option in options
        ]

        return PollResponseDTO(
            poll_id=UUID(meeting.id),
            meeting_id=UUID(meeting.id),
            question=f"Vote for meeting: {meeting.meeting_title}",
            options=hydrated_options,
            total_votes=sum(option.votes for option in hydrated_options),
        )

    def submit_vote(self, poll_id: UUID, option_id: str, voter_id: str | None) -> VoteResponseDTO:
        meeting = self._db.query(MeetingORM).filter(MeetingORM.id == str(poll_id)).first()
        if meeting is None:
            raise KeyError("poll_not_found")

        options = self._build_poll_options(meeting)
        if option_id not in {option.option_id for option in options}:
            raise ValueError("invalid_option")

        participant = self._resolve_participant(voter_id=voter_id)
        vote = (
            self._db.query(ParticipantVoteORM)
            .filter(
                ParticipantVoteORM.meeting_id == meeting.id,
                ParticipantVoteORM.participant_id == participant.id,
            )
            .first()
        )
        if vote is None:
            vote = ParticipantVoteORM(meeting_id=meeting.id, participant_id=participant.id)
            self._db.add(vote)

        vote.available_blocks = [{"option_id": option_id}]
        self._db.commit()

        votes_by_option = self._collect_votes_by_option(meeting_id=meeting.id, option_ids={option.option_id for option in options})

        return VoteResponseDTO(
            poll_id=UUID(meeting.id),
            option_id=option_id,
            option_votes=votes_by_option.get(option_id, 0),
            total_votes=sum(votes_by_option.values()),
        )

    def get_dashboard(self) -> DashboardResponseDTO:
        try:
            meetings = self._db.query(MeetingORM).order_by(MeetingORM.created_at.desc()).all()

            recent_meetings = [
                DashboardMeetingDTO(
                    meeting_id=UUID(meeting.id),
                    title=meeting.meeting_title,
                    status=self._normalize_dashboard_status(meeting.status),
                    participants=self._count_participants(meeting.id),
                    created_at=meeting.created_at,
                )
                for meeting in meetings[:5]
            ]

            poll_source = [meeting for meeting in meetings if not self._is_draft(meeting)]
            polls = [
                DashboardPollDTO(
                    meeting_id=UUID(meeting.id),
                    poll_id=UUID(meeting.id),
                    title=meeting.meeting_title,
                    status=self._normalize_dashboard_status(meeting.status),
                    participants=self._count_participants(meeting.id),
                    created_at=meeting.created_at,
                )
                for meeting in poll_source
            ]

            calendar_meetings = [
                DashboardCalendarMeetingDTO(
                    meeting_id=UUID(meeting.id),
                    title=meeting.meeting_title,
                    status=self._normalize_dashboard_status(meeting.status),
                    start_at=meeting.created_at,
                    end_at=meeting.created_at + timedelta(minutes=int(meeting.duration_minutes or 60)),
                )
                for meeting in sorted(poll_source, key=lambda current: current.created_at)
            ]

            active_meetings = sum(
                1
                for meeting in meetings
                if not self._is_draft(meeting)
                and self._normalize_dashboard_status(meeting.status) != "closed"
            )
            upcoming_meetings = sum(
                1
                for meeting in meetings
                if not self._is_draft(meeting)
                and self._normalize_dashboard_status(meeting.status) == "scheduled"
            )

            return DashboardResponseDTO(
                active_meetings=active_meetings,
                upcoming_meetings=upcoming_meetings,
                open_polls=len(polls),
                recent_meetings=recent_meetings,
                polls=polls,
                calendar_meetings=calendar_meetings,
            )
        except Exception:
            return DashboardResponseDTO(
                active_meetings=0,
                upcoming_meetings=0,
                open_polls=0,
                recent_meetings=[],
                polls=[],
                calendar_meetings=[],
            )

    def _resolve_participant(self, voter_id: str | None) -> UserORM:
        raw_voter = (voter_id or "").strip() or secrets.token_hex(8)
        normalized_voter = "".join(character if character.isalnum() else "-" for character in raw_voter).strip("-").lower()
        safe_voter = normalized_voter or secrets.token_hex(8)
        email = f"integration-voter-{safe_voter[:64]}@local.invalid"

        participant = self._db.query(UserORM).filter(UserORM.email == email).first()
        if participant is not None:
            return participant

        suffix = secrets.token_hex(4)
        participant = UserORM(
            name=f"Voter-{suffix}",
            surname="Integration",
            email=email,
            hashed_password=secrets.token_urlsafe(24),
        )
        self._db.add(participant)
        self._db.flush()
        return participant

    @classmethod
    def _build_poll_options(cls, meeting: MeetingORM) -> list[PollOptionDTO]:
        proposed_blocks = meeting.proposed_blocks or []
        options: list[PollOptionDTO] = []

        for index, block in enumerate(proposed_blocks):
            option_id = cls._option_id_from_index(index)
            day = str(block.get("day", "")).strip().upper()
            start_time = str(block.get("start_time", "")).strip()
            end_time = str(block.get("end_time", "")).strip()

            if day and start_time and end_time:
                label = f"{day} {start_time}-{end_time}"
            elif day:
                label = day
            else:
                label = f"Option {index + 1}"

            options.append(PollOptionDTO(option_id=option_id, label=label, votes=0))

        if options:
            return options

        return [PollOptionDTO(option_id=option_id, label=label, votes=0) for option_id, label in cls.DEFAULT_POLL_OPTIONS]

    @staticmethod
    def _option_id_from_index(index: int) -> str:
        if index < 26:
            return f"option-{chr(ord('a') + index)}"
        return f"option-{index + 1}"

    def _collect_votes_by_option(self, meeting_id: str, option_ids: set[str]) -> dict[str, int]:
        votes_by_option = {option_id: 0 for option_id in option_ids}
        votes = self._db.query(ParticipantVoteORM).filter(ParticipantVoteORM.meeting_id == meeting_id).all()
        for vote in votes:
            selected_option = self._extract_selected_option(vote)
            if selected_option in votes_by_option:
                votes_by_option[selected_option] += 1
        return votes_by_option

    @staticmethod
    def _extract_selected_option(vote: ParticipantVoteORM) -> str | None:
        raw_blocks = vote.available_blocks or []
        if not raw_blocks:
            return None

        first = raw_blocks[0]
        if not isinstance(first, dict):
            return None

        selected = first.get("option_id")
        if isinstance(selected, str) and selected:
            return selected
        return None

    def _count_participants(self, meeting_id: str) -> int:
        return self._db.query(ParticipantVoteORM).filter(ParticipantVoteORM.meeting_id == meeting_id).count()

    @classmethod
    def _normalize_dashboard_status(cls, raw_status: str | None) -> str:
        status = (raw_status or "").strip()
        if status in cls.KNOWN_DASHBOARD_STATUSES:
            return status
        return "confirmed"

    @classmethod
    def _is_draft(cls, meeting: MeetingORM) -> bool:
        return bool(meeting.is_draft) or cls._normalize_dashboard_status(meeting.status) == "draft"
