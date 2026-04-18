import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from checklist_service.checklist_service import ChecklistService


def test_generate_checklist_markdown():
    """Run an integration-style checklist generation scenario."""
    service = ChecklistService()
    output_path = Path(__file__).resolve().parent / "generated_meeting_checklist.md"

    try:
        saved_file = service.save_meeting_checklist_markdown(
            output_path=str(output_path),
            meeting_agenda="Decoration creation planning",
            meeting_description=(
                "Team discussion to define decoration concepts, materials, timeline, "
                "and execution ownership for an event space."
            ),
            meeting_characteristic="Creative planning with budget and logistics constraints",
            item_count=8,
        )

        print(f"\nGenerated checklist saved to: {saved_file}")
        print(output_path.read_text(encoding="utf-8"))

    except Exception as e:
        print(f"\nTest failed: {e}")
        print("\nChecklist:")
        print("1. credentials.json is available and points to a valid service account.")
        print("2. Vertex AI API is enabled in Google Cloud.")
        print("3. The service account has at least the Vertex AI User role.")


if __name__ == "__main__":
    test_generate_checklist_markdown()
