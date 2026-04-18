from dataclasses import dataclass


@dataclass(slots=True)
class User:
    """Participant metadata used for meeting location recommendations."""

    user_id: str
    base_lat: float
    base_lon: float
