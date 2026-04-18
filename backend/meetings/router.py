from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from auth.models import UserORM
from db import get_db
from meetings.domain import (
    MeetingCreateRequest,
    MeetingDetailsResponse,
    MeetingResponse,
    MeetingUpdateRequest,
    MeetingVoteRequest,
    TriggerAIResponse,
)
from meetings.service import MeetingService

# Tworzymy router dedykowany tylko dla spotkań
router = APIRouter(
    prefix="/meetings",
    tags=["Meetings"]
)

@router.post("", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
def create_meeting(
    payload: MeetingCreateRequest,
    db: Session = Depends(get_db),
    current_user: UserORM = Depends(get_current_user),
):
    return MeetingService.create_meeting(
        db=db,
        organizer=current_user,
        proposed_blocks=payload.proposed_blocks,
        availability_deadline=payload.availability_deadline,
    )


@router.put("/{meeting_id}", response_model=MeetingResponse)
def update_meeting(
    meeting_id: UUID,
    payload: MeetingUpdateRequest,
    db: Session = Depends(get_db),
    current_user: UserORM = Depends(get_current_user),
):
    return MeetingService.update_meeting_by_organizer(
        db=db,
        meeting_id=meeting_id,
        organizer=current_user,
        proposed_blocks=payload.proposed_blocks,
        availability_deadline=payload.availability_deadline,
    )


@router.get("/{meeting_id}", response_model=MeetingDetailsResponse)
def get_meeting_details(
    meeting_id: UUID,
    db: Session = Depends(get_db),
    current_user: UserORM = Depends(get_current_user),
):
    return MeetingService.get_meeting_for_organizer(db=db, meeting_id=meeting_id, organizer=current_user)


@router.post("/join/{public_token}/availability", response_model=MeetingResponse)
def submit_availability(
    public_token: str,
    payload: MeetingVoteRequest,
    db: Session = Depends(get_db),
    current_user: UserORM = Depends(get_current_user),
):
    return MeetingService.submit_participant_availability(
        db=db,
        public_token=public_token,
        participant=current_user,
        availability=payload.availability,
    )


@router.post("/{meeting_id}/ai-recommendation", response_model=TriggerAIResponse)
def trigger_ai_recommendation(
    meeting_id: UUID,
    db: Session = Depends(get_db),
    current_user: UserORM = Depends(get_current_user),
):
    return MeetingService.trigger_ai_recommendation(db=db, meeting_id=meeting_id, organizer=current_user)
