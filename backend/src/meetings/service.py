from datetime import datetime, timezone
from uuid import UUID
import secrets

from fastapi import HTTPException, status
from pydantic import ValidationError
from sqlalchemy.orm import Session

from ..database.models import MeetingORM, ParticipantVoteORM, UserORM
from .common import ParticipantAvailability, TimeBlock
from .domain import (
    MeetingDetailsResponse,
    MeetingJoinResponse,
    MeetingResponse,
    MeetingStatus,
    ParticipantAvailabilityResponse,
    TriggerAIResponse,
)


class MeetingService:
    @staticmethod
    def _utc_now() -> datetime:
        return datetime.now(timezone.utc)

    @staticmethod
    def _normalize_utc(dt: datetime, *, allow_naive: bool = False) -> datetime:
        if dt.tzinfo is None or dt.tzinfo.utcoffset(dt) is None:
            if allow_naive:
                return dt.replace(tzinfo=timezone.utc)
            raise ValueError("Datetime must include timezone information")
        return dt.astimezone(timezone.utc)

    @staticmethod
    def _reject_non_canonical_storage(detail: str) -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
        )

    @staticmethod
    def _to_timeblocks(raw_blocks: list[dict]) -> list[TimeBlock]:
        try:
            return [TimeBlock(**block) for block in raw_blocks]
        except (TypeError, ValidationError, ValueError) as exc:
            raise MeetingService._reject_non_canonical_storage(
                "Meeting contains non-canonical proposed_blocks data"
            ) from exc

    @staticmethod
    def _serialize_timeblocks(blocks: list[TimeBlock]) -> list[dict]:
        return [block.model_dump(mode="json") for block in blocks]

    @classmethod
    def _is_fully_contained_in_any_proposed_block(
        cls,
        submitted_block: TimeBlock,
        proposed_blocks: list[TimeBlock],
    ) -> bool:
        submitted_start = cls._normalize_utc(submitted_block.start_time)
        submitted_end = cls._normalize_utc(submitted_block.end_time)
        return any(
            cls._normalize_utc(proposed_block.start_time) <= submitted_start
            and submitted_end <= cls._normalize_utc(proposed_block.end_time)
            for proposed_block in proposed_blocks
        )

    @classmethod
    def _validate_participant_blocks_within_proposed(
        cls,
        availability: ParticipantAvailability,
        proposed_blocks: list[TimeBlock],
    ) -> None:
        submitted_blocks = [*availability.available_blocks, *availability.maybe_blocks]
        for block in submitted_blocks:
            if not cls._is_fully_contained_in_any_proposed_block(block, proposed_blocks):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Przeslane przedzialy musza miescic sie w zaproponowanych terminach",
                )

    @classmethod
    def _participant_availability_response(cls, vote: ParticipantVoteORM) -> ParticipantAvailabilityResponse:
        return ParticipantAvailabilityResponse(
            participant_id=vote.participant_id,
            available_blocks=cls._to_timeblocks(vote.available_blocks),
            maybe_blocks=cls._to_timeblocks(vote.maybe_blocks),
        )

    @classmethod
    def _meeting_response(cls, meeting: MeetingORM) -> MeetingResponse:
        return MeetingResponse(
            id=meeting.id,
            organizer_id=meeting.organizer_id,
            meeting_title=meeting.meeting_title,
            duration_minutes=meeting.duration_minutes,
            location=meeting.location,
            description=meeting.description,
            status=MeetingStatus(meeting.status),
            availability_deadline=meeting.availability_deadline,
            proposed_blocks=cls._to_timeblocks(meeting.proposed_blocks),
            public_link=f"/meetings/join/{meeting.public_token}",
            ai_recommendation=meeting.ai_recommendation,
        )

    @classmethod
    def _meeting_join_response(cls, meeting: MeetingORM) -> MeetingJoinResponse:
        return MeetingJoinResponse(
            id=meeting.id,
            meeting_title=meeting.meeting_title,
            duration_minutes=meeting.duration_minutes,
            location=meeting.location,
            description=meeting.description,
            status=MeetingStatus(meeting.status),
            availability_deadline=meeting.availability_deadline,
            proposed_blocks=cls._to_timeblocks(meeting.proposed_blocks),
            public_link=f"/meetings/join/{meeting.public_token}",
            ai_recommendation=meeting.ai_recommendation,
        )

    @classmethod
    def _touch_deadline_transition(cls, db: Session, meeting: MeetingORM) -> None:
        try:
            deadline = cls._normalize_utc(meeting.availability_deadline, allow_naive=True)
        except ValueError as exc:
            raise cls._reject_non_canonical_storage(
                "Meeting contains non-canonical availability_deadline data"
            ) from exc

        if meeting.status != MeetingStatus.COLLECTING_AVAILABILITY.value or cls._utc_now() < deadline:
            return

        # Guard transition with status predicate so concurrent requests do not oscillate state.
        (
            db.query(MeetingORM)
            .filter(
                MeetingORM.id == meeting.id,
                MeetingORM.status == MeetingStatus.COLLECTING_AVAILABILITY.value,
            )
            .update({MeetingORM.status: MeetingStatus.READY_FOR_AI.value}, synchronize_session=False)
        )
        db.commit()
        db.refresh(meeting)

    @classmethod
    def create_meeting(
        cls,
        db: Session,
        organizer: UserORM,
        meeting_title: str,
        duration_minutes: int,
        location: str,
        description: str | None,
        proposed_blocks: list[TimeBlock],
        availability_deadline: datetime,
    ) -> MeetingResponse:
        try:
            normalized_deadline = cls._normalize_utc(availability_deadline)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="availability_deadline must include timezone information",
            ) from exc
        if normalized_deadline <= cls._utc_now():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Deadline musi byc w przyszlosci",
            )

        meeting = MeetingORM(
            organizer_id=organizer.id,
            meeting_title=meeting_title,
            duration_minutes=duration_minutes,
            location=location,
            description=description,
            status=MeetingStatus.COLLECTING_AVAILABILITY.value,
            availability_deadline=normalized_deadline,
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
        meeting_title: str,
        duration_minutes: int,
        location: str,
        description: str | None,
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
        try:
            normalized_deadline = cls._normalize_utc(availability_deadline)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="availability_deadline must include timezone information",
            ) from exc
        if normalized_deadline <= cls._utc_now():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Deadline musi byc w przyszlosci",
            )

        meeting.meeting_title = meeting_title
        meeting.duration_minutes = duration_minutes
        meeting.location = location
        meeting.description = description
        meeting.proposed_blocks = cls._serialize_timeblocks(proposed_blocks)
        meeting.availability_deadline = normalized_deadline
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

        votes = db.query(ParticipantVoteORM).filter(ParticipantVoteORM.meeting_id == meeting.id).all()
        participant_availabilities = [
            cls._participant_availability_response(vote)
            for vote in votes
            if vote.participant_id != organizer.id
        ]
        data = cls._meeting_response(meeting)
        return MeetingDetailsResponse(
            **data.model_dump(),
            votes_count=len(votes),
            participant_availabilities=participant_availabilities,
        )

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

        cls._validate_participant_blocks_within_proposed(
            availability=availability,
            proposed_blocks=cls._to_timeblocks(meeting.proposed_blocks),
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
        vote.maybe_blocks = cls._serialize_timeblocks(availability.maybe_blocks)
        db.commit()
        db.refresh(meeting)
        return cls._meeting_response(meeting)

    @classmethod
    def get_meeting_by_public_token(cls, db: Session, public_token: str) -> MeetingJoinResponse:
        meeting = db.query(MeetingORM).filter(MeetingORM.public_token == public_token).first()
        if not meeting:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nieprawidlowy link")

        cls._touch_deadline_transition(db, meeting)

        return cls._meeting_join_response(meeting)

    @classmethod
    def trigger_ai_recommendation(cls, db: Session, meeting_id: UUID, organizer: UserORM) -> TriggerAIResponse:
        meeting = db.query(MeetingORM).filter(MeetingORM.id == str(meeting_id)).first()
        if not meeting:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting nie istnieje")
        if meeting.organizer_id != organizer.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Brak dostepu")

        cls._touch_deadline_transition(db, meeting)

        if meeting.status != MeetingStatus.READY_FOR_AI.value:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="AI mozna uruchomic dopiero po zakonczeniu zbierania dostepnosci",
            )

        votes = db.query(ParticipantVoteORM).filter(ParticipantVoteORM.meeting_id == meeting.id).all()
        recommendation = cls._build_recommendation(meeting, votes)

        meeting.ai_recommendation = recommendation
        meeting.status = MeetingStatus.AI_RECOMMENDED.value
        db.commit()
        db.refresh(meeting)

        return TriggerAIResponse(
            id=meeting.id,
            status=MeetingStatus(meeting.status),
            ai_recommendation=recommendation,
        )

    @classmethod
    def _build_recommendation(cls, meeting: MeetingORM, votes: list[ParticipantVoteORM]) -> str:
        if not votes:
            return "Brak glosow uczestnikow. Zaproponuj nowy termin i uruchom zbieranie ponownie."

        proposed_blocks = cls._to_timeblocks(meeting.proposed_blocks)
        if not proposed_blocks:
            return "Brak propozycji terminow."

        best_score = -1
        best_block = proposed_blocks[0]

        for candidate in proposed_blocks:
            score = 0
            for vote in votes:
                available = cls._to_timeblocks(vote.available_blocks)
                maybe = cls._to_timeblocks(vote.maybe_blocks)
                if cls._overlaps_any(candidate, available):
                    score += 2
                elif cls._overlaps_any(candidate, maybe):
                    score += 1
            if score > best_score:
                best_score = score
                best_block = candidate

        return (
            f"Rekomendacja AI: wybierz termin {best_block.start_time.isoformat()} - "
            f"{best_block.end_time.isoformat()} (score={best_score})."
        )

    @staticmethod
    def _overlaps_any(candidate: TimeBlock, blocks: list[TimeBlock]) -> bool:
        for block in blocks:
            if candidate.start_time < block.end_time and block.start_time < candidate.end_time:
                return True
        return False

