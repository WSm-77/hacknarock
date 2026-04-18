from uuid import UUID

from .models import CreateMeetingRequestDTO, CreateMeetingResponseDTO, DashboardResponseDTO, PollResponseDTO, VoteResponseDTO
from .repositories.in_memory_store import IntegrationInMemoryStore, integration_in_memory_store


class IntegrationService:
    """Application service for frontend integration endpoints."""

    def __init__(self, repository: IntegrationInMemoryStore) -> None:
        self._repository = repository

    def create_meeting(self, payload: CreateMeetingRequestDTO) -> CreateMeetingResponseDTO:
        return self._repository.create_meeting(payload)

    def get_dashboard(self) -> DashboardResponseDTO:
        return self._repository.get_dashboard()

    def get_poll(self, poll_id: UUID) -> PollResponseDTO:
        return self._repository.get_poll(poll_id)

    def submit_vote(self, poll_id: UUID, option_id: str, voter_id: str | None) -> VoteResponseDTO:
        return self._repository.submit_vote(poll_id=poll_id, option_id=option_id, voter_id=voter_id)


integration_service = IntegrationService(repository=integration_in_memory_store)

# Backward-compat alias used by existing tests and router call sites.
integration_store = integration_in_memory_store
