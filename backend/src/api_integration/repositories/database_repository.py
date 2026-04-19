from __future__ import annotations

from collections import Counter
from datetime import datetime, timedelta, timezone
import secrets
from uuid import UUID

from pydantic import ValidationError
from sqlalchemy.orm import Session
from src.database.meeting_states import MeetingStatus

from ...database.models import MeetingORM, ParticipantVoteORM, UserORM
from ...model.meetings_models import TimeBlock
from ..models import (
    ConfirmMeetingResponseDTO,
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
            "waiting_for_confirmation",
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

    @staticmethod
    def _poll_status_from_meeting_status(raw_status: str) -> str:
        if raw_status == "collecting_availability":
            return "collecting_votes"
        if raw_status in {"ready_for_ai", "ai_recommended", "finalized"}:
            return "finalized"
        return "confirmed"

    @staticmethod
    def _to_utc(dt: datetime) -> datetime:
        if dt.tzinfo is None or dt.tzinfo.utcoffset(dt) is None:
            raise ValueError("Meeting contains non-canonical availability_deadline data")
        return dt.astimezone(timezone.utc)

    @staticmethod
    def _canonical_blocks(raw_blocks: list[dict]) -> list[TimeBlock]:
        try:
            return [TimeBlock(**block) for block in raw_blocks]
        except (TypeError, ValidationError, ValueError) as exc:
            raise ValueError("Meeting contains non-canonical proposed_blocks data") from exc

    @staticmethod
    def _build_poll_options(blocks: list[TimeBlock]) -> list[PollOptionDTO]:
        return [
            PollOptionDTO(
                option_id=f"option-{index + 1}",
                label=f"{block.start_time.isoformat()} - {block.end_time.isoformat()}",
                votes=0,
            )
            for index, block in enumerate(blocks)
        ]

    def _poll_vote_counts(self, meeting_id: str) -> Counter[str]:
        votes = self._db.query(ParticipantVoteORM).filter(ParticipantVoteORM.meeting_id == meeting_id).all()
        counts: Counter[str] = Counter()
        for vote in votes:
            maybe_blocks = vote.maybe_blocks if isinstance(vote.maybe_blocks, list) else []
            if not maybe_blocks:
                continue
            first = maybe_blocks[0]
            if not isinstance(first, dict):
                continue
            option_id = first.get("option_id")
            if isinstance(option_id, str) and option_id:
                counts[option_id] += 1
        return counts

    def _poll_options_with_votes(self, meeting: MeetingORM) -> tuple[list[PollOptionDTO], int]:
        blocks = self._canonical_blocks(meeting.proposed_blocks)
        options = self._build_poll_options(blocks)
        counts = self._poll_vote_counts(meeting.id)

        total_votes = 0
        for option in options:
            option.votes = counts.get(option.option_id, 0)
            total_votes += option.votes

        return options, total_votes

    @staticmethod
    def _count_participants(meeting: MeetingORM) -> int:
        if meeting.participants_count is not None:
            return meeting.participants_count
        return 0

    def get_dashboard(self) -> DashboardResponseDTO:
        meetings = self._db.query(MeetingORM).order_by(MeetingORM.created_at.desc()).all()
        now = datetime.now(timezone.utc)

        active_meetings = 0
        upcoming_meetings = 0
        recent_meetings: list[DashboardMeetingDTO] = []
        polls: list[DashboardPollDTO] = []
        calendar_meetings: list[DashboardCalendarMeetingDTO] = []

        for meeting in meetings:
            if meeting.is_draft:
                continue

            participants = self._count_participants(meeting)
            poll_status = self._poll_status_from_meeting_status(meeting.status)
            deadline = self._to_utc(meeting.availability_deadline)

            active_meetings += 1
            if deadline >= now:
                upcoming_meetings += 1

            if len(recent_meetings) < 5:
                recent_meetings.append(
                    DashboardMeetingDTO(
                        meeting_id=UUID(meeting.id),
                        title=meeting.meeting_title,
                        status=poll_status,
                        participants=participants,
                        created_at=meeting.created_at,
                    )
                )

            polls.append(
                DashboardPollDTO(
                    meeting_id=UUID(meeting.id),
                    poll_id=UUID(meeting.id),
                    title=meeting.meeting_title,
                    status=poll_status,
                    participants=participants,
                    created_at=meeting.created_at,
                )
            )

            blocks = self._canonical_blocks(meeting.proposed_blocks)
            if blocks:
                start_at = min(block.start_time for block in blocks)
                end_at = max(block.end_time for block in blocks)
            else:
                start_at = deadline
                end_at = deadline

            calendar_meetings.append(
                DashboardCalendarMeetingDTO(
                    meeting_id=UUID(meeting.id),
                    title=meeting.meeting_title,
                    status=poll_status,
                    start_at=start_at,
                    end_at=end_at,
                )
            )

        open_polls = sum(1 for poll in polls if poll.status == "collecting_votes")
        return DashboardResponseDTO(
            active_meetings=active_meetings,
            upcoming_meetings=upcoming_meetings,
            open_polls=open_polls,
            recent_meetings=recent_meetings,
            polls=polls,
            calendar_meetings=calendar_meetings,
        )

    def get_poll(self, poll_id: UUID) -> PollResponseDTO:
        meeting = self._db.query(MeetingORM).filter(MeetingORM.id == str(poll_id), MeetingORM.is_draft.is_(False)).first()
        if not meeting:
            raise KeyError("poll not found")

        options, total_votes = self._poll_options_with_votes(meeting)
        return PollResponseDTO(
            poll_id=poll_id,
            meeting_id=UUID(meeting.id),
            question=f"Wybierz termin spotkania: {meeting.meeting_title}",
            options=options,
            total_votes=total_votes,
        )

    def submit_vote(self, poll_id: UUID, option_id: str, voter_id: str) -> VoteResponseDTO:
        meeting = self._db.query(MeetingORM).filter(MeetingORM.id == str(poll_id), MeetingORM.is_draft.is_(False)).first()
        if not meeting:
            raise KeyError("poll not found")

        options, _ = self._poll_options_with_votes(meeting)
        allowed_option_ids = {option.option_id for option in options}
        if option_id not in allowed_option_ids:
            raise ValueError("invalid poll option")

        vote = (
            self._db.query(ParticipantVoteORM)
            .filter(
                ParticipantVoteORM.meeting_id == meeting.id,
                ParticipantVoteORM.participant_id == voter_id,
            )
            .first()
        )
        if vote is None:
            vote = ParticipantVoteORM(
                meeting_id=meeting.id,
                participant_id=voter_id,
                available_blocks=[],
                maybe_blocks=[],
            )
            self._db.add(vote)

        vote.available_blocks = []
        vote.maybe_blocks = [{"option_id": option_id}]
        self._db.flush()
        self._transition_to_waiting_for_confirmation_if_ready(meeting)
        self._db.commit()

        _, total_votes = self._poll_options_with_votes(meeting)
        option_votes = self._poll_vote_counts(meeting.id).get(option_id, 0)
        return VoteResponseDTO(
            poll_id=poll_id,
            option_id=option_id,
            option_votes=option_votes,
            total_votes=total_votes,
        )

    def confirm_meeting(self, meeting_id: UUID) -> ConfirmMeetingResponseDTO:
        meeting = self._db.query(MeetingORM).filter(MeetingORM.id == str(meeting_id)).first()
        if meeting is None:
            raise KeyError("meeting_not_found")

        if meeting.status == MeetingStatus.FINALIZED.value:
            return ConfirmMeetingResponseDTO(
                meeting_id=UUID(meeting.id),
                status=MeetingStatus.FINALIZED.value,
                message="Meeting already finalized.",
            )

        if meeting.status != MeetingStatus.WAITING_FOR_CONFIRMATION.value:
            raise ValueError("meeting_not_confirmable")

        meeting.status = MeetingStatus.FINALIZED.value
        self._db.commit()
        self._db.refresh(meeting)

        return ConfirmMeetingResponseDTO(
            meeting_id=UUID(meeting.id),
            status=MeetingStatus.FINALIZED.value,
            message="Meeting finalized.",
        )

    def confirm_meeting(self, meeting_id: UUID) -> ConfirmMeetingResponseDTO:
        meeting = self._db.query(MeetingORM).filter(MeetingORM.id == str(meeting_id)).first()
        if meeting is None:
            raise KeyError("meeting_not_found")

        if meeting.status == MeetingStatus.FINALIZED.value:
            return ConfirmMeetingResponseDTO(
                meeting_id=UUID(meeting.id),
                status=MeetingStatus.FINALIZED.value,
                message="Meeting already finalized.",
            )

        if meeting.status != MeetingStatus.WAITING_FOR_CONFIRMATION.value:
            raise ValueError("meeting_not_confirmable")

        meeting.status = MeetingStatus.FINALIZED.value
        self._db.commit()
        self._db.refresh(meeting)

        return ConfirmMeetingResponseDTO(
            meeting_id=UUID(meeting.id),
            status=MeetingStatus.FINALIZED.value,
            message="Meeting finalized.",
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

    def _transition_to_waiting_for_confirmation_if_ready(self, meeting: MeetingORM) -> None:
        if meeting.status != "collecting_votes":
            return

        if self._count_participants(meeting.id) < 3:
            return

        meeting.status = MeetingStatus.WAITING_FOR_CONFIRMATION.value

    @classmethod
    def _normalize_dashboard_status(cls, raw_status: str | None) -> str:
        status = (raw_status or "").strip()
        if status in cls.KNOWN_DASHBOARD_STATUSES:
            return status
        return "confirmed"

    @classmethod
    def _is_draft(cls, meeting: MeetingORM) -> bool:
        return bool(meeting.is_draft) or cls._normalize_dashboard_status(meeting.status) == "draft"
