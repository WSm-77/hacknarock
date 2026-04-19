from datetime import datetime, timezone
from uuid import UUID
import secrets

from fastapi import HTTPException, status
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
    def _normalize_utc(dt: datetime) -> datetime:
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)

    @staticmethod
    def _to_timeblocks(raw_blocks: list[dict]) -> list[TimeBlock]:
        return [TimeBlock(**block) for block in raw_blocks]

    @staticmethod
    def _serialize_timeblocks(blocks: list[TimeBlock]) -> list[dict]:
        return [block.model_dump(mode="json") for block in blocks]

    @staticmethod
    def _format_user_display_name(user: UserORM | None) -> str | None:
        if user is None:
            return None

        full_name = f"{user.name} {user.surname}".strip()
        if full_name:
            return full_name

        return user.email

    @classmethod
    def _is_fully_contained_in_any_proposed_block(
        cls,
        submitted_block: TimeBlock,
        proposed_blocks: list[TimeBlock],
    ) -> bool:
        """
        Check whether a submitted block fits entirely inside one proposed block.

        Args:
            submitted_block: The participant-submitted time block to validate.
            proposed_blocks: The organizer-proposed blocks allowed for selection.

        Returns:
            bool: True when the submitted block is fully contained in at least one proposed block.

        Raises:
            None.
        """
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
        """
        Reject participant availability blocks that fall outside proposed meeting blocks.

        Args:
            availability: The participant availability payload to validate.
            proposed_blocks: The organizer-proposed blocks allowed for selection.

        Returns:
            None: The method only validates and raises on invalid input.

        Raises:
            HTTPException: Raised with HTTP 400 when any available or maybe block is out of range.
        """
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
    def _resolve_organizer_name(cls, db: Session, organizer_id: str) -> str | None:
        organizer = db.query(UserORM).filter(UserORM.id == organizer_id).first()
        return cls._format_user_display_name(organizer)

    @classmethod
    def _meeting_response(cls, meeting: MeetingORM, organizer_name: str | None = None) -> MeetingResponse:
        return MeetingResponse(
            id=meeting.id,
            organizer_id=meeting.organizer_id,
            organizer_name=organizer_name,
            title=meeting.meeting_title,
            description=meeting.description,
            location=meeting.location,
            participants_count=meeting.participants_count,
            duration_minutes=meeting.duration_minutes,
            is_draft=meeting.is_draft,
            created_at=meeting.created_at,
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
            proposed_blocks=meeting.proposed_blocks,
            public_link=f"/meetings/join/{meeting.public_token}",
            ai_recommendation=meeting.ai_recommendation,
        )

    @staticmethod
    def _touch_deadline_transition(meeting: MeetingORM) -> bool:
        deadline = MeetingService._normalize_utc(meeting.availability_deadline)
        if (
            meeting.status == MeetingStatus.COLLECTING_AVAILABILITY.value
            and MeetingService._utc_now() >= deadline
        ):
            meeting.status = MeetingStatus.READY_FOR_AI.value
            return True
        return False

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
        normalized_deadline = cls._normalize_utc(availability_deadline)
        if normalized_deadline <= cls._utc_now():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Deadline must be in the future.",
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
        return cls._meeting_response(meeting, organizer_name=cls._format_user_display_name(organizer))

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
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting does not exist.")
        if meeting.organizer_id != organizer.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

        cls._touch_deadline_transition(meeting)
        if meeting.status != MeetingStatus.COLLECTING_AVAILABILITY.value:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cannot edit after availability collection has finished.",
            )
        normalized_deadline = cls._normalize_utc(availability_deadline)
        if normalized_deadline <= cls._utc_now():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Deadline must be in the future.",
            )

        meeting.meeting_title = meeting_title
        meeting.duration_minutes = duration_minutes
        meeting.location = location
        meeting.description = description
        meeting.proposed_blocks = cls._serialize_timeblocks(proposed_blocks)
        meeting.availability_deadline = normalized_deadline
        db.commit()
        db.refresh(meeting)
        return cls._meeting_response(meeting, organizer_name=cls._format_user_display_name(organizer))

    @classmethod
    def _get_meeting_by_id(cls, db: Session, meeting_id: UUID) -> MeetingORM:
        meeting = db.query(MeetingORM).filter(MeetingORM.id == str(meeting_id)).first()
        if not meeting:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting does not exist.")
        return meeting

    @classmethod
    def _get_meeting_for_organizer(cls, db: Session, meeting_id: UUID, organizer: UserORM) -> MeetingORM:
        meeting = cls._get_meeting_by_id(db=db, meeting_id=meeting_id)
        if meeting.organizer_id != organizer.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

        changed = cls._touch_deadline_transition(meeting)
        if changed:
            db.commit()
            db.refresh(meeting)

        return meeting

    @classmethod
    def get_meeting_for_organizer(cls, db: Session, meeting_id: UUID, organizer: UserORM) -> MeetingResponse:
        meeting = cls._get_meeting_for_organizer(db=db, meeting_id=meeting_id, organizer=organizer)
        return cls._meeting_response(meeting, organizer_name=cls._format_user_display_name(organizer))

    @classmethod
    def get_meeting_details_for_organizer(cls, db: Session, meeting_id: UUID, organizer: UserORM) -> MeetingDetailsResponse:
        meeting = cls._get_meeting_for_organizer(db=db, meeting_id=meeting_id, organizer=organizer)

        votes_count = db.query(ParticipantVoteORM).filter(ParticipantVoteORM.meeting_id == meeting.id).count()
        data = cls._meeting_response(meeting, organizer_name=cls._format_user_display_name(organizer))
        return MeetingDetailsResponse(
            **data.model_dump(),
            votes_count=votes_count,
            auto_find_venue=meeting.auto_find_venue,
            venue_recommendations_count=meeting.venue_recommendations_count,
        )

    @classmethod
    def get_meeting_details_public(cls, db: Session, meeting_id: UUID) -> MeetingDetailsResponse:
        meeting = cls._get_meeting_by_id(db=db, meeting_id=meeting_id)

        changed = cls._touch_deadline_transition(meeting)
        if changed:
            db.commit()
            db.refresh(meeting)

        votes_count = db.query(ParticipantVoteORM).filter(ParticipantVoteORM.meeting_id == meeting.id).count()
        organizer_name = cls._resolve_organizer_name(db=db, organizer_id=meeting.organizer_id)
        data = cls._meeting_response(meeting, organizer_name=organizer_name)
        return MeetingDetailsResponse(
            **data.model_dump(),
            votes_count=votes_count,
            auto_find_venue=meeting.auto_find_venue,
            venue_recommendations_count=meeting.venue_recommendations_count,
        )
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
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid link.")

        changed = cls._touch_deadline_transition(meeting)
        if changed:
            db.commit()
            db.refresh(meeting)

        if meeting.status != MeetingStatus.COLLECTING_AVAILABILITY.value:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Availability collection is closed.",
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
        organizer_name = cls._resolve_organizer_name(db=db, organizer_id=meeting.organizer_id)
        return cls._meeting_response(meeting, organizer_name=organizer_name)

    @classmethod
    def get_meeting_by_public_token(cls, db: Session, public_token: str) -> MeetingJoinResponse:
        meeting = db.query(MeetingORM).filter(MeetingORM.public_token == public_token).first()
        if not meeting:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nieprawidlowy link")

        changed = cls._touch_deadline_transition(meeting)
        if changed:
            db.commit()
            db.refresh(meeting)

        return cls._meeting_join_response(meeting)

    @classmethod
    def trigger_ai_recommendation(cls, db: Session, meeting_id: UUID, organizer: UserORM) -> TriggerAIResponse:
        meeting = db.query(MeetingORM).filter(MeetingORM.id == str(meeting_id)).first()
        if not meeting:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting does not exist.")
        if meeting.organizer_id != organizer.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

        changed = cls._touch_deadline_transition(meeting)
        if changed:
            db.commit()
            db.refresh(meeting)

        if meeting.status != MeetingStatus.READY_FOR_AI.value:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="AI can only be triggered after availability collection has finished.",
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
            return "No participant votes were found. Propose a new time and restart availability collection."

        proposed_blocks = cls._to_timeblocks(meeting.proposed_blocks)
        if not proposed_blocks:
            return "No proposed time windows were found."

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
            f"AI recommendation: choose the time window {best_block.start_time.isoformat()} - "
            f"{best_block.end_time.isoformat()} (score={best_score})."
        )

    @staticmethod
    def _overlaps_any(candidate: TimeBlock, blocks: list[TimeBlock]) -> bool:
        for block in blocks:
            if candidate.start_time < block.end_time and block.start_time < candidate.end_time:
                return True
        return False

