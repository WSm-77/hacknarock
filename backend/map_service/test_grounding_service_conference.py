import json

from grounding_service import GroundingService


def test_conference_meeting_for_50_people():
    """Run a conference-room recommendation scenario for a large business meeting."""
    service = GroundingService()

    try:
        result = service.recommend_meeting_locations(
            users=None,
            number_of_participants=50,
            user_location=False,
            meeting_hours=[
                {
                    "start": "2026-04-22T09:00:00",
                    "end": "2026-04-22T13:00:00",
                    "timezone": "Europe/Warsaw",
                },
                {
                    "start": "2026-04-23T09:00:00",
                    "end": "2026-04-23T13:00:00",
                    "timezone": "Europe/Warsaw",
                },
            ],
            meeting_duration_minutes=240,
            meeting_agenda=(
                "Business strategy workshop and quarterly planning. "
                "The venue must provide a conference room suitable for 50 participants."
            ),
            preferred_area="Krakow city center",
            recommendation_count=5,
        )

        print("\nConference venue recommendations (JSON):")
        print(json.dumps(result, indent=2, ensure_ascii=False))

    except Exception as e:
        print(f"\nTest failed: {e}")
        print("\nChecklist:")
        print("1. credentials.json is available and points to a valid service account.")
        print("2. Vertex AI API and Places API (New) are enabled in Google Cloud.")
        print("3. The service account has at least the Vertex AI User role.")


if __name__ == "__main__":
    test_conference_meeting_for_50_people()
