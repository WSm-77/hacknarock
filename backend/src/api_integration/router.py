from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database.session import get_db
from .models import (
    CreateMeetingRequestDTO,
    CreateMeetingResponseDTO,
    DashboardResponseDTO,
    PollResponseDTO,
    VoteRequestDTO,
    VoteResponseDTO,
)
from .service import integration_service

router = APIRouter(prefix="/api", tags=["Integration"])


@router.get("/dashboard", response_model=DashboardResponseDTO)
def get_dashboard(db: Session = Depends(get_db)) -> DashboardResponseDTO:
    """Return dashboard payload projected from persisted meeting and voting data."""
    return integration_service.get_dashboard(db=db)


@router.post(
    "/meetings",
    response_model=CreateMeetingResponseDTO,
    status_code=status.HTTP_201_CREATED,
)
def create_meeting(payload: CreateMeetingRequestDTO, db: Session = Depends(get_db)) -> CreateMeetingResponseDTO:
    """Create a meeting and expose it through integration poll endpoints."""
    try:
        return integration_service.create_meeting(db=db, payload=payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


@router.get("/polls/{poll_id}", response_model=PollResponseDTO)
def get_poll(poll_id: UUID, db: Session = Depends(get_db)) -> PollResponseDTO:
    """Return poll details and vote option counters for a meeting poll."""
    try:
        return integration_service.get_poll(db=db, poll_id=poll_id)
    except KeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Poll not found",
        ) from exc


@router.post("/polls/{poll_id}/votes", response_model=VoteResponseDTO)
def submit_vote(poll_id: UUID, payload: VoteRequestDTO, db: Session = Depends(get_db)) -> VoteResponseDTO:
    """Persist a vote for a poll option and return updated vote totals."""
    try:
        return integration_service.submit_vote(
            db=db,
            poll_id=poll_id,
            option_id=payload.option_id,
            voter_id=payload.voter_id,
        )
    except KeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Poll not found",
        ) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid poll option",
        ) from exc
    except OverflowError as exc:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Poll voter limit reached",
        ) from exc
