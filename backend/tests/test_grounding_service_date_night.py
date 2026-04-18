import json
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from grounding_service.grounding_service import GroundingService
from grounding_service.user import User


def test_evening_date_for_two_people():
    """Recommend cozy evening date venues for two participants."""
    service = GroundingService()

    users = [
        User(
            user_id="date_user_1",
            base_lat=50.064650,
            base_lon=19.944980,
        ),
        User(
            user_id="date_user_2",
            base_lat=50.051720,
            base_lon=19.936250,
        ),
    ]

    try:
        result = service.recommend_meeting_locations(
            users=users,
            number_of_participants=2,
            user_location=True,
            meeting_hours=[
                {
                    "start": "2026-04-25T19:00:00",
                    "end": "2026-04-25T22:30:00",
                    "timezone": "Europe/Warsaw",
                },
                {
                    "start": "2026-04-26T19:00:00",
                    "end": "2026-04-26T22:30:00",
                    "timezone": "Europe/Warsaw",
                },
            ],
            meeting_duration_minutes=180,
            meeting_agenda=(
                "Date night for two people. Prioritize cozy, intimate places with calm "
                "lighting, comfortable seating, and good evening atmosphere."
            ),
            preferred_area="Kazimierz, Podgorze, or Old Town",
            recommendation_count=8,
        )

        print("\nEvening date recommendations (JSON):")
        print(json.dumps(result, indent=2, ensure_ascii=False))

    except Exception as e:
        print(f"\nTest failed: {e}")
        print("\nChecklist:")
        print("1. credentials.json is available and points to a valid service account.")
        print("2. Vertex AI API and Places API (New) are enabled in Google Cloud.")
        print("3. The service account has at least the Vertex AI User role.")


if __name__ == "__main__":
    test_evening_date_for_two_people()
