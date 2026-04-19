from uuid import UUID

from sqlalchemy.orm import Session

from .models import DashboardResponseDTO, PollResponseDTO, VoteResponseDTO
from .repositories.database_repository import IntegrationDatabaseRepository


class IntegrationService:
    """Application service for frontend integration endpoints."""

    @staticmethod
    def _repository(db: Session) -> IntegrationDatabaseRepository:
        return IntegrationDatabaseRepository(db=db)

    def get_dashboard(self, db: Session) -> DashboardResponseDTO:
        """
        Return the dashboard contract consumed by the frontend.

        Args:
            None: This method delegates to the configured repository.

        Returns:
            DashboardResponseDTO: Dashboard counters, recent meetings,
            polls, and calendar_meetings.

        Raises:
            Any: Propagates repository errors unchanged.
        """
        return self._repository(db).get_dashboard()

    def get_poll(self, db: Session, poll_id: UUID) -> PollResponseDTO:
        return self._repository(db).get_poll(poll_id)

    def submit_vote(self, db: Session, poll_id: UUID, option_id: str, voter_id: str) -> VoteResponseDTO:
        return self._repository(db).submit_vote(poll_id=poll_id, option_id=option_id, voter_id=voter_id)


integration_service = IntegrationService()
