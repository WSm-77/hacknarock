import json
import os
from collections.abc import Iterable
from dataclasses import asdict
from statistics import fmean
from typing import Any
from urllib.parse import quote_plus

from dotenv import load_dotenv
from google import genai
from google.genai import types

try:
	from .user import User
except ImportError:
	from user import User


class GroundingService:
	"""Generate grounded meeting location recommendations using Google Maps."""

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

	def recommend_meeting_locations(
		self,
		users: list[User] | None = None,
		number_of_participants: int | None = None,
		user_location: bool = True,
		meeting_hours: str | dict[str, str] | Iterable[str | dict[str, str]] | None = None,
		meeting_duration_minutes: int | None = None,
		meeting_agenda: str | None = None,
		preferred_area: str | None = None,
		recommendation_count: int | None = None,
	) -> dict[str, Any]:
		normalized_users = users or []

		if number_of_participants is not None and number_of_participants <= 0:
			raise ValueError("number_of_participants must be greater than zero")

		inferred_participants = len(normalized_users)
		participant_count = number_of_participants or inferred_participants
		if participant_count <= 0:
			raise ValueError(
				"Provide users or number_of_participants greater than zero"
			)

		location_count = recommendation_count or self._default_location_count(participant_count)
		meeting_hours_text = self._meeting_hours_text(meeting_hours)
		prompt = self._build_prompt(
			users=normalized_users,
			user_location=user_location,
			participant_count=participant_count,
			location_count=location_count,
			meeting_hours_text=meeting_hours_text,
			meeting_duration_minutes=meeting_duration_minutes,
			meeting_agenda=meeting_agenda,
			preferred_area=preferred_area,
		)

		response = self.client.models.generate_content(
			model=self.model,
			contents=prompt,
			config=types.GenerateContentConfig(
				# tools=[types.Tool(google_maps=types.GoogleMaps())],
				response_mime_type="application/json",
				response_schema=self._response_schema(location_count),
			),
		)

		payload = self._parse_json_response(response.text)
		self._validate_location_count(payload, location_count)

		for loc in payload["locations"]:
			loc["maps_link"] = f"https://www.google.com/maps/search/?api=1&query={quote_plus(loc['name'] + ' ' + loc['address'])}"

		return payload

	@staticmethod
	def _default_location_count(user_count: int) -> int:
		if user_count <= 2:
			return 2
		if user_count <= 5:
			return 3
		if user_count <= 10:
			return 4
		return 5

	@staticmethod
	def _response_schema(location_count: int) -> dict[str, Any]:
		location_item = {
			"type": "object",
			"properties": {
				"name": {"type": "string"},
				"address": {"type": "string"},
				"rating": {"type": "number"},
				"reason": {"type": "string"},
			},
			"required": ["name", "address", "rating", "reason"],
			"additionalProperties": False,
		}

		return {
			"type": "object",
			"properties": {
				"locations": {
					"type": "array",
					"items": location_item,
					"minItems": location_count,
					"maxItems": location_count,
				}
			},
			"required": ["locations"],
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
	def _validate_location_count(payload: dict[str, Any], expected_count: int) -> None:
		locations = payload.get("locations")
		if not isinstance(locations, list):
			raise ValueError("Response must contain a 'locations' list")
		if len(locations) != expected_count:
			raise ValueError(
				f"Expected {expected_count} locations, got {len(locations)}"
			)

	def _build_prompt(
		self,
		users: list[User],
		user_location: bool,
		participant_count: int,
		location_count: int,
		meeting_hours_text: str,
		meeting_duration_minutes: int | None,
		meeting_agenda: str | None,
		preferred_area: str | None,
	) -> str:
		centroid_text = self._centroid_text(users, user_location)
		users_json = json.dumps([asdict(user) for user in users], ensure_ascii=False)
		location_mode = "enabled" if user_location else "disabled"

		return (
			"Recommend meeting venues in Krakow using Google Maps grounding. "
			"Take into account participant count and meeting context. "
			"Only return places that are open during the entire requested meeting window. "
			f"Number of users in payload: {len(users)}. "
			f"User location mode: {location_mode}. "
			f"Actual meeting participants count: {participant_count}. "
			f"Required number of venue options: {location_count}. "
			f"Group centroid coordinates: {centroid_text}. "
			f"Meeting hours window: {meeting_hours_text}. "
			f"Meeting duration (minutes): {meeting_duration_minutes if meeting_duration_minutes is not None else 'not provided'}. "
			f"Meeting agenda: {meeting_agenda if meeting_agenda else 'not provided'}. "
			f"Preferred area: {preferred_area if preferred_area else 'not provided'}. "
			"Users payload: "
			f"{users_json}. "
			"If user location mode is disabled, ignore coordinates and focus on agenda, capacity, and area constraints. "
			"Return JSON only with exactly this top-level structure: "
			"{\"locations\": ["
			"{\"name\": \"<venue_name>\", \"address\": \"<street_address_city_postal_code>\", "
			"\"rating\": <rating_number>, \"reason\": \"<short_justification>\"}"
			"]}. "
			"Do not include markdown, code fences, comments, or extra keys."
		)

	@staticmethod
	def _meeting_hours_text(
		meeting_hours: str | dict[str, str] | Iterable[str | dict[str, str]] | None,
	) -> str:
		"""Normalize meeting hours input from string, object, or iterable windows."""
		if meeting_hours is None:
			return "not provided"

		if isinstance(meeting_hours, str):
			value = meeting_hours.strip()
			if not value:
				raise ValueError("meeting_hours cannot be empty")
			return value

		if isinstance(meeting_hours, dict):
			return GroundingService._format_meeting_window(meeting_hours)

		if isinstance(meeting_hours, Iterable):
			windows = list(meeting_hours)
			if not windows:
				raise ValueError("meeting_hours iterable cannot be empty")

			normalized_windows = []
			for idx, window in enumerate(windows):
				if isinstance(window, str):
					value = window.strip()
					if not value:
						raise ValueError(f"meeting_hours[{idx}] cannot be empty")
					normalized_windows.append(f"window_{idx + 1}=({value})")
				elif isinstance(window, dict):
					normalized_windows.append(
						f"window_{idx + 1}=({GroundingService._format_meeting_window(window)})"
					)
				else:
					raise ValueError(
						"meeting_hours iterable items must be strings or dicts"
					)

			return "; ".join(normalized_windows)

		raise ValueError("meeting_hours must be a string, dict, iterable, or None")

	@staticmethod
	def _format_meeting_window(window: dict[str, str]) -> str:
		"""Format one meeting time window dict."""
		start = str(window.get("start", "")).strip()
		end = str(window.get("end", "")).strip()
		timezone = str(window.get("timezone", "Europe/Warsaw")).strip()
		if not start or not end:
			raise ValueError("meeting_hours dict must include non-empty 'start' and 'end'")
		return f"start={start}, end={end}, timezone={timezone or 'Europe/Warsaw'}"

	@staticmethod
	def _centroid_text(
		users: list[User],
		user_location: bool,
	) -> str:
		if not user_location:
			return "not considered"

		if users:
			centroid_lat = fmean(user.base_lat for user in users)
			centroid_lon = fmean(user.base_lon for user in users)
			return f"lat={centroid_lat:.6f}, lon={centroid_lon:.6f}"

		return "not provided"