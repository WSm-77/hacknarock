from datetime import datetime
from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4

from pydantic import BaseModel, model_validator, Field

class Coordinates(BaseModel):
    """Dokładne współrzędne geograficzne uczestnika wybrane na mapie."""
    latitude: float
    longitude: float


class MeetingDetails(BaseModel):
    """
    Hybrydowe szczegóły spotkania.
    Sztywne pola sterują UI, a `ai_context` pozwala na nieograniczoną dynamikę.
    """
    title: str
    description: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class TimeBlock(BaseModel):
    """Podstawowy przedział czasowy."""
    start_time: datetime
    end_time: datetime

    @model_validator(mode='after')
    def check_time_order(self) -> 'TimeBlock':
        if self.start_time >= self.end_time:
            raise ValueError("Czas rozpoczęcia musi być wcześniejszy niż czas zakończenia.")
        return self

class ProposedBlock(TimeBlock):
    """Przedział czasowy zaproponowany przez organizatora."""
    id: UUID = Field(default_factory=uuid4)


class ParticipantAvailability(BaseModel):
    """Zbiór przedziałów czasowych i lokalizacji uczestnika dla danego spotkania."""
    available_blocks: List[TimeBlock] = Field(default_factory=list)
    maybe_blocks: List[TimeBlock] = Field(default_factory=list)
    coordinates: Optional[Coordinates] = None

