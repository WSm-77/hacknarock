from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth.dependencies import get_current_user
from ..database.models import UserORM
from ..database.session import get_db
from .models import (
    DashboardResponseDTO,
    PollResponseDTO,
    VoteRequestDTO,
    VoteResponseDTO,
)
from .service import integration_service

router = APIRouter(
    prefix="/api",
    tags=["Integration"],
)


@router.get("/dashboard", response_model=DashboardResponseDTO)
def get_dashboard(
    db: Session = Depends(get_db),
    _: UserORM = Depends(get_current_user),
) -> DashboardResponseDTO:
    """Return dashboard payload projected from persisted meeting and voting data."""
    try:
        return integration_service.get_dashboard(db=db)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc


@router.get("/polls/{poll_id}", response_model=PollResponseDTO)
def get_poll(
    poll_id: UUID,
    db: Session = Depends(get_db),
    _: UserORM = Depends(get_current_user),
) -> PollResponseDTO:
    """Return poll data for organizer dashboard flows, separate from participant availability API."""
    try:
        return integration_service.get_poll(db=db, poll_id=poll_id)
    except KeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Poll not found",
        ) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc


@router.post("/polls/{poll_id}/votes", response_model=VoteResponseDTO)
def submit_vote(
    poll_id: UUID,
    payload: VoteRequestDTO,
    db: Session = Depends(get_db),
    current_user: UserORM = Depends(get_current_user),
) -> VoteResponseDTO:
    """Persist a dashboard poll vote in a flow separate from participant availability submission."""
    try:
        return integration_service.submit_vote(
            db=db,
            poll_id=poll_id,
            option_id=payload.option_id,
            voter_id=current_user.id,
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
