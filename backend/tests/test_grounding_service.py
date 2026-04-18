import json
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from backend.src.grounding_service.grounding_service import GroundingService
from backend.src.grounding_service.user import User


def test_krakow_meeting_service():
    """Run an integration-style check for multi-user meeting recommendations."""
    service = GroundingService()

    users = [
        User(
            user_id="u1",
            base_lat=50.061430,
            base_lon=19.936580,
        ),
        User(
            user_id="u2",
            base_lat=50.054950,
            base_lon=19.945000,
        ),
        User(
            user_id="u3",
            base_lat=50.067120,
            base_lon=19.923850,
        ),
        User(
            user_id="u4",
            base_lat=50.048500,
            base_lon=19.960200,
        ),
    ]

    try:
        result = service.recommend_meeting_locations(
            users=users,
            meeting_hours=[
                {
                    "start": "2026-04-21T17:00:00",
                    "end": "2026-04-21T19:00:00",
                    "timezone": "Europe/Warsaw",
                },
                {
                    "start": "2026-04-22T17:00:00",
                    "end": "2026-04-22T19:00:00",
                    "timezone": "Europe/Warsaw",
                },
            ],
            meeting_duration_minutes=120,
            meeting_agenda="Planning holiday decorations",
            preferred_area="Kazimierz or Old Town",
            recommendation_count=3,
        )

        print("\nGoogle Maps grounded recommendations (JSON):")
        print(json.dumps(result, indent=2, ensure_ascii=False))

    except Exception as e:
        print(f"\nTest failed: {e}")
        print("\nChecklist:")
        print("1. credentials.json is available and points to a valid service account.")
        print("2. Vertex AI API and Places API (New) are enabled in Google Cloud.")
        print("3. The service account has at least the Vertex AI User role.")

if __name__ == "__main__":
    test_krakow_meeting_service()
