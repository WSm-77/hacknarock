from pydantic import BaseModel

from .dashboard_meeting_dto import DashboardMeetingDTO


class DashboardResponseDTO(BaseModel):
    active_meetings: int
    upcoming_meetings: int
    open_polls: int
    recent_meetings: list[DashboardMeetingDTO]
