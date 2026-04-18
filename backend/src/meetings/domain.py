from enum import Enum
from uuid import UUID, uuid4
from datetime import datetime
from typing import List, Dict, Optional, Union, Literal, Any
from pydantic import BaseModel, Field, EmailStr, model_validator

from backend.src.meetings.common import ProposedBlock, ParticipantAvailability, MeetingDetails, TimeBlock


# ==========================================
# 1. WYJĄTKI DOMENOWE
# ==========================================

class UnauthorizedActionError(Exception):
    """Wyjątek rzucany, gdy akcję próbuje wykonać ktoś inny niż organizator."""

    def __init__(self, action: str):
        super().__init__(f"Brak uprawnień. Tylko organizator może wykonać akcję: {action}")


# ==========================================
# 2. VALUE OBJECTS & POMOCNICZE TYPY
# ==========================================

class AvailabilityOption(str, Enum):
    AVAILABLE = "AVAILABLE"  # Tak
    MAYBE = "MAYBE"  # Możliwe
    UNAVAILABLE = "UNAVAILABLE"  # Nie

class Organizer(BaseModel):
    """Encja twórcy spotkania."""
    id: UUID = Field(default_factory=uuid4)
    name: str
    email: Optional[EmailStr] = None


class Participant(BaseModel):
    """Encja uczestnika głosowania."""
    id: UUID = Field(default_factory=uuid4)
    nickname: str
    email: Optional[EmailStr] = None


# ==========================================
# 3. KLASA BAZOWA DLA STANÓW
# ==========================================

class BaseMeetingState(BaseModel):
    """Baza dla wszystkich stanów spotkania. Zawiera logikę autoryzacji."""
    id: UUID = Field(default_factory=uuid4)
    organizer_id: UUID

    def _verify_organizer(self, actor_id: UUID, action: str):
        if actor_id != self.organizer_id:
            raise UnauthorizedActionError(action)


# ==========================================
# 4. STANY SPOTKANIA (Maszyna Stanów)
# ==========================================

class MeetingCancelled(BaseMeetingState):
    """Stan anulowany - ślepa uliczka, brak dalszych akcji."""
    reason: Optional[str] = None


class MeetingDraft(BaseMeetingState):
    """Szkic spotkania. Można tylko dodawać bloki czasowe i publikować."""
    proposed_blocks: List[ProposedBlock] = Field(default_factory=list)

    def add_proposed_block(self, actor_id: UUID, start: datetime, end: datetime) -> "MeetingDraft":
        self._verify_organizer(actor_id, "dodawanie propozycji czasowej")
        new_blocks = self.proposed_blocks.copy()
        new_blocks.append(ProposedBlock(start_time=start, end_time=end))
        return MeetingDraft(id=self.id, organizer_id=self.organizer_id, proposed_blocks=new_blocks)

    def remove_proposed_block(self, actor_id: UUID, block_id: UUID) -> "MeetingDraft":
        self._verify_organizer(actor_id, "usuwanie propozycji czasowej")
        new_blocks = [block for block in self.proposed_blocks if block.id != block_id]
        return MeetingDraft(id=self.id, organizer_id=self.organizer_id, proposed_blocks=new_blocks)

    def publish(self, actor_id: UUID, deadline: datetime) -> "MeetingGatheringAvailability":
        self._verify_organizer(actor_id, "publikacja spotkania")
        if not self.proposed_blocks:
            raise ValueError("Musisz podać przynajmniej jedno proponowane okno czasowe przed publikacją.")
        return MeetingGatheringAvailability(
            id=self.id,
            organizer_id=self.organizer_id,
            proposed_blocks=self.proposed_blocks,
            voting_deadline=deadline,
            votes={}
        )

    def cancel(self, actor_id: UUID, reason: str = "Anulowano szkic") -> MeetingCancelled:
        self._verify_organizer(actor_id, "anulowanie spotkania")
        return MeetingCancelled(id=self.id, organizer_id=self.organizer_id, reason=reason)


class MeetingGatheringAvailability(BaseMeetingState):
    """Trwa głosowanie. Wymagany deadline. Przechowujemy głosy uczestników."""
    proposed_blocks: List[ProposedBlock]
    voting_deadline: datetime
    votes: Dict[UUID, ParticipantAvailability]  # Uczestnik ID -> Jego bloki dostępności

    def submit_vote(self, participant_id: UUID,
                    availability: ParticipantAvailability) -> "MeetingGatheringAvailability":
        # Uczestnicy mogą głosować, więc nie weryfikujemy tu organizatora
        new_votes = self.votes.copy()
        new_votes[participant_id] = availability

        return MeetingGatheringAvailability(
            id=self.id,
            organizer_id=self.organizer_id,
            proposed_blocks=self.proposed_blocks,
            voting_deadline=self.voting_deadline,
            votes=new_votes
        )

    def close_voting(self, actor_id: UUID) -> "MeetingVotingClosed":
        self._verify_organizer(actor_id, "ręczne zamknięcie głosowania")
        return MeetingVotingClosed(
            id=self.id,
            organizer_id=self.organizer_id,
            proposed_blocks=self.proposed_blocks,
            votes=self.votes
        )

    def cancel(self, actor_id: UUID, reason: str = "Anulowano podczas zbierania głosów") -> MeetingCancelled:
        self._verify_organizer(actor_id, "anulowanie spotkania")
        return MeetingCancelled(id=self.id, organizer_id=self.organizer_id, reason=reason)


class MeetingVotingClosed(BaseMeetingState):
    """Zamknięte głosowanie. Czekamy na uruchomienie algorytmu najlepszego terminu."""
    proposed_blocks: List[ProposedBlock]
    votes: Dict[UUID, ParticipantAvailability]

    def select_best_time(self, best_block: TimeBlock) -> "MeetingPendingDetails":
        # Metoda wywoływana przez algorytm/system, wstrzykuje wyliczony czas
        return MeetingPendingDetails(
            id=self.id,
            organizer_id=self.organizer_id,
            proposed_blocks=self.proposed_blocks,
            votes=self.votes,
            selected_block=best_block
        )

    def cancel(self, actor_id: UUID, reason: str = "Anulowano po zamknięciu ankiet") -> MeetingCancelled:
        self._verify_organizer(actor_id, "anulowanie spotkania")
        return MeetingCancelled(id=self.id, organizer_id=self.organizer_id, reason=reason)


class MeetingPendingDetails(BaseMeetingState):
    """Mamy zbieżny termin. Czekamy aż organizator wpisze agendę, ustalenia dot. jedzenia itp."""
    proposed_blocks: List[ProposedBlock]
    votes: Dict[UUID, ParticipantAvailability]
    selected_block: TimeBlock

    def submit_details(self, actor_id: UUID, details: MeetingDetails) -> "MeetingProcessingAI":
        self._verify_organizer(actor_id, "zatwierdzanie szczegółów spotkania")
        return MeetingProcessingAI(
            id=self.id,
            organizer_id=self.organizer_id,
            proposed_blocks=self.proposed_blocks,
            votes=self.votes,
            selected_block=self.selected_block,
            details=details
        )

    def cancel(self, actor_id: UUID, reason: str = "Anulowano podczas wpisywania szczegółów") -> MeetingCancelled:
        self._verify_organizer(actor_id, "anulowanie spotkania")
        return MeetingCancelled(id=self.id, organizer_id=self.organizer_id, reason=reason)


class MeetingProcessingAI(BaseMeetingState):
    """Asynchroniczny stan - czekamy na odpowiedź z zewnętrznego API AI."""
    proposed_blocks: List[ProposedBlock]
    votes: Dict[UUID, ParticipantAvailability]
    selected_block: TimeBlock
    details: MeetingDetails

    def complete_processing(self, generated_agenda_html: str) -> "MeetingFinalized":
        # Wewnętrzna metoda systemu, nie wymaga autoryzacji organizatora
        return MeetingFinalized(
            id=self.id,
            organizer_id=self.organizer_id,
            proposed_blocks=self.proposed_blocks,
            votes=self.votes,
            selected_block=self.selected_block,
            details=self.details,
            agenda_html=generated_agenda_html
        )


class MeetingFinalized(BaseMeetingState):
    """Koniec flow. Spotkanie w pełni zorganizowane."""
    proposed_blocks: List[ProposedBlock]
    votes: Dict[UUID, ParticipantAvailability]
    selected_block: TimeBlock
    details: MeetingDetails
    agenda_html: str


# ==========================================
# 5. TYP ZBIORCZY DLA ENDPOINTÓW (Union)
# ==========================================

MeetingState = Union[
    MeetingDraft,
    MeetingGatheringAvailability,
    MeetingVotingClosed,
    MeetingPendingDetails,
    MeetingProcessingAI,
    MeetingFinalized,
    MeetingCancelled
]
