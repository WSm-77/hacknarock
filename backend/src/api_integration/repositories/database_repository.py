from collections import Counter
from datetime import datetime, timezone
from uuid import UUID

from pydantic import ValidationError
from sqlalchemy.orm import Session

from ...database.models import MeetingORM, ParticipantVoteORM
from ...model.meetings_models import TimeBlock
from ..models import (
    DashboardCalendarMeetingDTO,
    DashboardMeetingDTO,
    DashboardPollDTO,
    DashboardResponseDTO,
    PollOptionDTO,
    PollResponseDTO,
    VoteResponseDTO,
)


class IntegrationDatabaseRepository:
    """Database-backed repository used by integration dashboard and poll endpoints."""

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
        self._db.commit()

        _, total_votes = self._poll_options_with_votes(meeting)
        option_votes = self._poll_vote_counts(meeting.id).get(option_id, 0)
        return VoteResponseDTO(
            poll_id=poll_id,
            option_id=option_id,
            option_votes=option_votes,
            total_votes=total_votes,
        )
