import json
import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from google import genai
from google.genai import types


class ChecklistService:
    """Generate a meeting checklist in Markdown using Gemini."""

    def __init__(
        self,
        project_id: str | None = None,
        location: str = "us-central1",
        model: str = "gemini-2.5-flash",
    ) -> None:
        load_dotenv()
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv(
            "GOOGLE_APPLICATION_CREDENTIALS", "credentials.json"
        )

        self.model = model
        self.client = genai.Client(
            vertexai=True,
            project=project_id or os.getenv("GOOGLE_CLOUD_PROJECT", "notesfrommeetings"),
            location=location,
        )

    def generate_meeting_checklist_markdown(
        self,
        meeting_agenda: str,
        meeting_description: str,
        meeting_characteristic: str,
        item_count: int = 8,
    ) -> str:
        """Return a Markdown checklist tailored to meeting context."""
        agenda = meeting_agenda.strip()
        description = meeting_description.strip()
        characteristic = meeting_characteristic.strip()

        if not agenda:
            raise ValueError("meeting_agenda cannot be empty")
        if not description:
            raise ValueError("meeting_description cannot be empty")
        if not characteristic:
            raise ValueError("meeting_characteristic cannot be empty")
        if item_count < 3 or item_count > 20:
            raise ValueError("item_count must be between 3 and 20")

        prompt = self._build_prompt(
            meeting_agenda=agenda,
            meeting_description=description,
            meeting_characteristic=characteristic,
            item_count=item_count,
        )

        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=self._response_schema(item_count),
            ),
        )

        payload = self._parse_json_response(response.text)
        items = payload.get("items")
        if not isinstance(items, list) or len(items) != item_count:
            raise ValueError("Model response must contain the expected number of checklist items")

        return self._format_markdown(
            meeting_agenda=agenda,
            meeting_characteristic=characteristic,
            items=items,
        )

    def save_meeting_checklist_markdown(
        self,
        output_path: str,
        meeting_agenda: str,
        meeting_description: str,
        meeting_characteristic: str,
        item_count: int = 8,
    ) -> str:
        """Generate checklist markdown and save it to a .md file."""
        file_path = Path(output_path).expanduser()
        if file_path.suffix.lower() != ".md":
            raise ValueError("output_path must point to a .md file")

        markdown = self.generate_meeting_checklist_markdown(
            meeting_agenda=meeting_agenda,
            meeting_description=meeting_description,
            meeting_characteristic=meeting_characteristic,
            item_count=item_count,
        )

        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_text(markdown, encoding="utf-8")
        return str(file_path)

    @staticmethod
    def _response_schema(item_count: int) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "items": {
                    "type": "array",
                    "minItems": item_count,
                    "maxItems": item_count,
                    "items": {
                        "type": "string",
                    },
                }
            },
            "required": ["items"],
            "additionalProperties": False,
        }

    @staticmethod
    def _parse_json_response(raw_text: str) -> dict[str, Any]:
        cleaned = raw_text.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(cleaned)
        if not isinstance(parsed, dict):
            raise ValueError("Model response must be a JSON object")
        return parsed

    @staticmethod
    def _build_prompt(
        meeting_agenda: str,
        meeting_description: str,
        meeting_characteristic: str,
        item_count: int,
    ) -> str:
        return (
            "Create a practical checklist for preparing and running a meeting. "
            f"Generate exactly {item_count} concise checklist items. "
            "Each item must be specific, actionable, and written in plain English. "
            "Avoid duplicates and avoid generic advice. "
            f"Meeting agenda: {meeting_agenda}. "
            f"Meeting description: {meeting_description}. "
            f"Overall meeting characteristic: {meeting_characteristic}. "
            "Return JSON only in this structure: "
            '{"items": ["item 1", "item 2"]}. '
            "Do not include markdown, comments, or additional keys."
        )

    @staticmethod
    def _format_markdown(
        meeting_agenda: str,
        meeting_characteristic: str,
        items: list[str],
    ) -> str:
        title = f"# Meeting Checklist: {meeting_agenda}"
        context = f"_Characteristic: {meeting_characteristic}_"

        checklist_lines = []
        for item in items:
            text = item.strip().rstrip(".")
            if text:
                checklist_lines.append(f"- [ ] {text}")

        if not checklist_lines:
            raise ValueError("Model returned empty checklist items")

        return "\n".join([title, "", context, "", *checklist_lines]) + "\n"
