from datetime import UTC, datetime
from threading import Lock
from uuid import UUID, uuid4

from ..models import (
    CreateMeetingRequestDTO,
    CreateMeetingResponseDTO,
    DashboardMeetingDTO,
    DashboardResponseDTO,
    PollOptionDTO,
    PollResponseDTO,
    VoteResponseDTO,
)


class IntegrationInMemoryStore:
    """Simple in-memory repository for frontend-backend integration flows."""

    MAX_MEETINGS = 500
    MAX_POLLS = 500
    MAX_VOTERS_PER_POLL = 1000

    def __init__(self) -> None:
        self._lock = Lock()
        self._meetings: dict[str, dict] = {}
        self._polls: dict[str, dict] = {}

    def create_meeting(self, payload: CreateMeetingRequestDTO) -> CreateMeetingResponseDTO:
        with self._lock:
            if len(self._meetings) >= self.MAX_MEETINGS or len(self._polls) >= self.MAX_POLLS:
                raise OverflowError("integration_store_capacity_reached")

            meeting_id = uuid4()
            poll_id = uuid4()
            now = datetime.now(UTC)

            options = [
                {"option_id": "option-a", "label": "Option A", "votes": 0},
                {"option_id": "option-b", "label": "Option B", "votes": 0},
                {"option_id": "option-c", "label": "Option C", "votes": 0},
            ]

            self._meetings[str(meeting_id)] = {
                "meeting_id": meeting_id,
                "title": payload.title,
                "description": payload.description,
                "status": "collecting_votes",
                "participants": 0,
                "created_at": now,
                "poll_id": poll_id,
            }

            self._polls[str(poll_id)] = {
                "poll_id": poll_id,
                "meeting_id": meeting_id,
                "question": f"Vote for meeting: {payload.title}",
                "options": options,
                "votes_by_voter": {},
            }

            return CreateMeetingResponseDTO(
                meeting_id=meeting_id,
                poll_id=poll_id,
                status="created",
                message="Meeting created and poll opened.",
            )

    def get_dashboard(self) -> DashboardResponseDTO:
        with self._lock:
            meetings = list(self._meetings.values())
            recent_meetings = sorted(
                meetings,
                key=lambda meeting: meeting["created_at"],
                reverse=True,
            )[:5]

            dashboard_meetings = [
                DashboardMeetingDTO(
                    meeting_id=meeting["meeting_id"],
                    title=meeting["title"],
                    status=meeting["status"],
                    participants=meeting["participants"],
                    created_at=meeting["created_at"],
                )
                for meeting in recent_meetings
            ]

            return DashboardResponseDTO(
                active_meetings=sum(1 for meeting in meetings if meeting["status"] != "closed"),
                upcoming_meetings=sum(1 for meeting in meetings if meeting["status"] == "scheduled"),
                open_polls=len(self._polls),
                recent_meetings=dashboard_meetings,
            )

    def get_poll(self, poll_id: UUID) -> PollResponseDTO:
        with self._lock:
            poll = self._polls.get(str(poll_id))
            if poll is None:
                raise KeyError("poll_not_found")

            options = [
                PollOptionDTO(
                    option_id=option["option_id"],
                    label=option["label"],
                    votes=option["votes"],
                )
                for option in poll["options"]
            ]

            total_votes = sum(option.votes for option in options)

            return PollResponseDTO(
                poll_id=poll["poll_id"],
                meeting_id=poll["meeting_id"],
                question=poll["question"],
                options=options,
                total_votes=total_votes,
            )

    def submit_vote(
        self,
        poll_id: UUID,
        option_id: str,
        voter_id: str | None,
    ) -> VoteResponseDTO:
        with self._lock:
            poll = self._polls.get(str(poll_id))
            if poll is None:
                raise KeyError("poll_not_found")

            is_new_voter = voter_id is not None and voter_id not in poll["votes_by_voter"]
            if is_new_voter and len(poll["votes_by_voter"]) >= self.MAX_VOTERS_PER_POLL:
                raise OverflowError("poll_voter_capacity_reached")

            selected_option = next(
                (option for option in poll["options"] if option["option_id"] == option_id),
                None,
            )
            if selected_option is None:
                raise ValueError("invalid_option")

            resolved_voter_id = voter_id or str(uuid4())
            previous_option_id = poll["votes_by_voter"].get(resolved_voter_id)

            if previous_option_id and previous_option_id != option_id:
                previous_option = next(
                    (
                        option
                        for option in poll["options"]
                        if option["option_id"] == previous_option_id
                    ),
                    None,
                )
                if previous_option and previous_option["votes"] > 0:
                    previous_option["votes"] -= 1

            if previous_option_id != option_id:
                selected_option["votes"] += 1

            poll["votes_by_voter"][resolved_voter_id] = option_id

            meeting = self._meetings.get(str(poll["meeting_id"]))
            if meeting is not None:
                meeting["participants"] = len(poll["votes_by_voter"])

            total_votes = sum(option["votes"] for option in poll["options"])

            return VoteResponseDTO(
                poll_id=poll["poll_id"],
                option_id=option_id,
                option_votes=selected_option["votes"],
                total_votes=total_votes,
            )


integration_in_memory_store = IntegrationInMemoryStore()
