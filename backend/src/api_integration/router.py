from uuid import UUID

from fastapi import APIRouter, HTTPException, status
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
def get_dashboard() -> DashboardResponseDTO:
    """Zwraca podstawowe dane dashboardu dla widoku frontendu."""
    return integration_service.get_dashboard()


@router.post(
    "/meetings",
    response_model=CreateMeetingResponseDTO,
    status_code=status.HTTP_201_CREATED,
)
def create_meeting(payload: CreateMeetingRequestDTO) -> CreateMeetingResponseDTO:
    """Creates a lightweight integration meeting and opens a poll in memory."""
    try:
        return integration_service.create_meeting(payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except OverflowError as exc:
        if str(exc) == "integration_store_capacity_reached":
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Integration store capacity reached",
            ) from exc
        raise


@router.get("/polls/{poll_id}", response_model=PollResponseDTO)
def get_poll(poll_id: UUID) -> PollResponseDTO:
    """Zwraca szczegóły pojedynczej ankiety wraz z opcjami głosowania."""
    try:
        return integration_service.get_poll(poll_id)
    except KeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Poll not found",
        ) from exc


@router.post("/polls/{poll_id}/votes", response_model=VoteResponseDTO)
def submit_vote(poll_id: UUID, payload: VoteRequestDTO) -> VoteResponseDTO:
    """Zapisuje głos dla opcji ankiety i aktualizuje liczniki."""
    try:
        return integration_service.submit_vote(
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
