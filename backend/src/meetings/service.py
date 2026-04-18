from datetime import datetime
from datetime import timedelta
from uuid import UUID
import secrets

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..database.models import MeetingORM, ParticipantVoteORM, UserORM
from .common import ParticipantAvailability, TimeBlock
from .domain import MeetingDetailsResponse, MeetingResponse, MeetingStatus, TriggerAIResponse


class MeetingService:
    @staticmethod
    def _to_timeblocks(raw_blocks: list[dict]) -> list[TimeBlock]:
        return [TimeBlock(**block) for block in raw_blocks]

    @staticmethod
    def _serialize_timeblocks(blocks: list[TimeBlock]) -> list[dict]:
        return [block.model_dump(mode="json") for block in blocks]

    @classmethod
    def _meeting_response(cls, meeting: MeetingORM) -> MeetingResponse:
        return MeetingResponse(
            id=meeting.id,
            organizer_id=meeting.organizer_id,
            status=MeetingStatus(meeting.status),
            availability_deadline=meeting.availability_deadline,
            proposed_blocks=cls._to_timeblocks(meeting.proposed_blocks),
            public_link=f"/meetings/join/{meeting.public_token}",
            ai_recommendation=meeting.ai_recommendation,
        )

    @classmethod
    def _touch_deadline_transition(cls, db: Session, meeting: MeetingORM) -> bool:
        if meeting.status != MeetingStatus.COLLECTING_AVAILABILITY.value:
            return False
        if datetime.utcnow() < meeting.availability_deadline:
            return False

        votes = db.query(ParticipantVoteORM).filter(ParticipantVoteORM.meeting_id == meeting.id).all()
        best_interval = cls._select_best_continuous_interval(votes)

        if best_interval is None:
            meeting.choosen_blocks = []
        else:
            meeting.choosen_blocks = cls._serialize_timeblocks(
                [cls._fit_interval_to_duration(best_interval, meeting.duration_minutes)]
            )

        meeting.ai_recommendation = None
        meeting.status = MeetingStatus.AI_RECOMMENDED.value
        db.commit()
        db.refresh(meeting)
        return True

    @classmethod
    def create_meeting(
        cls,
        db: Session,
        organizer: UserORM,
        proposed_blocks: list[TimeBlock],
        availability_deadline: datetime,
    ) -> MeetingResponse:
        if availability_deadline <= datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Deadline musi byc w przyszlosci",
            )

        meeting = MeetingORM(
            organizer_id=organizer.id,
            status=MeetingStatus.COLLECTING_AVAILABILITY.value,
            availability_deadline=availability_deadline,
            proposed_blocks=cls._serialize_timeblocks(proposed_blocks),
            public_token=secrets.token_urlsafe(16),
        )
        db.add(meeting)
        db.commit()
        db.refresh(meeting)
        return cls._meeting_response(meeting)

    @classmethod
    def update_meeting_by_organizer(
        cls,
        db: Session,
        meeting_id: UUID,
        organizer: UserORM,
        proposed_blocks: list[TimeBlock],
        availability_deadline: datetime,
    ) -> MeetingResponse:
        meeting = db.query(MeetingORM).filter(MeetingORM.id == str(meeting_id)).first()
        if not meeting:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting nie istnieje")
        if meeting.organizer_id != organizer.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Brak dostepu")

        cls._touch_deadline_transition(db, meeting)
        if meeting.status != MeetingStatus.COLLECTING_AVAILABILITY.value:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Nie mozna edytowac po zakonczeniu zbierania dostepnosci",
            )
        if availability_deadline <= datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Deadline musi byc w przyszlosci",
            )

        meeting.proposed_blocks = cls._serialize_timeblocks(proposed_blocks)
        meeting.availability_deadline = availability_deadline
        db.commit()
        db.refresh(meeting)
        return cls._meeting_response(meeting)

    @classmethod
    def get_meeting_for_organizer(cls, db: Session, meeting_id: UUID, organizer: UserORM) -> MeetingDetailsResponse:
        meeting = db.query(MeetingORM).filter(MeetingORM.id == str(meeting_id)).first()
        if not meeting:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting nie istnieje")
        if meeting.organizer_id != organizer.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Brak dostepu")

        cls._touch_deadline_transition(db, meeting)

        votes_count = db.query(ParticipantVoteORM).filter(ParticipantVoteORM.meeting_id == meeting.id).count()
        data = cls._meeting_response(meeting)
        return MeetingDetailsResponse(**data.model_dump(), votes_count=votes_count)

    @classmethod
    def submit_participant_availability(
        cls,
        db: Session,
        public_token: str,
        participant: UserORM,
        availability: ParticipantAvailability,
    ) -> MeetingResponse:
        meeting = db.query(MeetingORM).filter(MeetingORM.public_token == public_token).first()
        if not meeting:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nieprawidlowy link")

        cls._touch_deadline_transition(db, meeting)

        if meeting.status != MeetingStatus.COLLECTING_AVAILABILITY.value:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Zbieranie dostepnosci jest zakonczone",
            )

        vote = (
            db.query(ParticipantVoteORM)
            .filter(
                ParticipantVoteORM.meeting_id == meeting.id,
                ParticipantVoteORM.participant_id == participant.id,
            )
            .first()
        )
        if not vote:
            vote = ParticipantVoteORM(meeting_id=meeting.id, participant_id=participant.id)
            db.add(vote)

        vote.available_blocks = cls._serialize_timeblocks(availability.available_blocks)
        db.commit()
        db.refresh(meeting)
        return cls._meeting_response(meeting)

    @classmethod
    def trigger_ai_recommendation(cls, db: Session, meeting_id: UUID, organizer: UserORM) -> TriggerAIResponse:
        meeting = db.query(MeetingORM).filter(MeetingORM.id == str(meeting_id)).first()
        if not meeting:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting nie istnieje")
        if meeting.organizer_id != organizer.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Brak dostepu")

        cls._touch_deadline_transition(db, meeting)

        if meeting.status == MeetingStatus.AI_RECOMMENDED.value:
            return TriggerAIResponse(
                id=meeting.id,
                status=MeetingStatus(meeting.status),
                ai_recommendation=cls._best_block_message_from_meeting(meeting),
            )

        if meeting.status != MeetingStatus.READY_FOR_AI.value:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="AI mozna uruchomic dopiero po zakonczeniu zbierania dostepnosci",
            )

        votes = db.query(ParticipantVoteORM).filter(ParticipantVoteORM.meeting_id == meeting.id).all()
        best_interval = cls._select_best_continuous_interval(votes)
        recommendation = cls._build_recommendation(votes, best_interval)

        if best_interval is None:
            meeting.choosen_blocks = []
        else:
            meeting.choosen_blocks = cls._serialize_timeblocks(
                [cls._fit_interval_to_duration(best_interval, meeting.duration_minutes)]
            )
        meeting.ai_recommendation = None
        meeting.status = MeetingStatus.AI_RECOMMENDED.value
        db.commit()
        db.refresh(meeting)

        return TriggerAIResponse(
            id=meeting.id,
            status=MeetingStatus(meeting.status),
            ai_recommendation=recommendation,
        )

    @classmethod
    def _build_recommendation(
        cls,
        votes: list[ParticipantVoteORM],
        best_interval: tuple[datetime, datetime, int] | None,
    ) -> str:
        if not votes:
            return "Brak glosow uczestnikow. Zaproponuj nowy termin i uruchom zbieranie ponownie."

        if best_interval is None:
            return "Brak przedzialow w available_blocks."

        best_start, best_end, best_votes = best_interval

        return (
            "Najlepszy przedzial czasowy: "
            f"{best_start.isoformat()} - {best_end.isoformat()} "
            f"(glosy={best_votes})."
        )

    @classmethod
    def _best_block_message_from_meeting(cls, meeting: MeetingORM) -> str:
        blocks = cls._to_timeblocks(meeting.choosen_blocks)
        if not blocks:
            return "Brak przedzialow w available_blocks."

        block = blocks[0]
        return f"Najlepszy przedzial czasowy: {block.start_time.isoformat()} - {block.end_time.isoformat()}."

    @staticmethod
    def _fit_interval_to_duration(
        best_interval: tuple[datetime, datetime, int],
        duration_minutes: int,
    ) -> TimeBlock:
        best_start, best_end, _ = best_interval
        required = timedelta(minutes=max(1, duration_minutes))

        if best_start + required <= best_end:
            return TimeBlock(start_time=best_start, end_time=best_start + required)

        # Fallback when the best continuous interval is shorter than requested duration.
        return TimeBlock(start_time=best_start, end_time=best_end)

    @classmethod
    def _select_best_continuous_interval(
        cls,
        votes: list[ParticipantVoteORM],
    ) -> tuple[datetime, datetime, int] | None:
        boundaries: set[datetime] = set()
        per_participant: dict[str, list[TimeBlock]] = {}

        for vote in votes:
            blocks = cls._to_timeblocks(vote.available_blocks)
            if not blocks:
                continue

            per_participant[vote.participant_id] = blocks
            for block in blocks:
                boundaries.add(block.start_time)
                boundaries.add(block.end_time)

        ordered_boundaries = sorted(boundaries)
        if len(ordered_boundaries) < 2:
            return None

        segments: list[tuple[datetime, datetime, int]] = []
        for idx in range(len(ordered_boundaries) - 1):
            seg_start = ordered_boundaries[idx]
            seg_end = ordered_boundaries[idx + 1]
            if seg_start >= seg_end:
                continue

            votes_count = 0
            for blocks in per_participant.values():
                if any(block.start_time <= seg_start and seg_end <= block.end_time for block in blocks):
                    votes_count += 1

            segments.append((seg_start, seg_end, votes_count))

        if not segments:
            return None

        max_votes = max(seg[2] for seg in segments)
        if max_votes <= 0:
            return None

        idx = 0
        while idx < len(segments):
            seg_start, seg_end, seg_votes = segments[idx]
            if seg_votes != max_votes:
                idx += 1
                continue

            # For ties, always choose the earliest chronological interval.
            run_start = seg_start
            run_end = seg_end
            next_idx = idx + 1

            while next_idx < len(segments) and segments[next_idx][2] == max_votes:
                run_end = segments[next_idx][1]
                next_idx += 1

            return run_start, run_end, max_votes

        return None

