# Backend (FastAPI)

Backend service for HackNaRock meeting scheduling and voting flows.

## Compose Integration

In local Compose, backend runs with:

- API base URL: `http://localhost:8000`
- Postgres connection from `DATABASE_URL`
- CORS origins from `FRONTEND_CORS_ORIGINS`

Compose also starts `frontend` and `postgres` together with backend.

## Key Endpoints Used by Frontend

| Endpoint | Method | Frontend page |
|---|---|---|
| `/api/dashboard` | `GET` | `Dashboard` (`/`) |
| `/api/meetings` | `POST` | `MeetingCreationWizard` (`/create`) |
| `/api/meetings/{meeting_id}/confirm` | `POST` | `MeetingConfirmation` (`/confirm/:meetingId`) |
| `/api/polls/{poll_id}` | `GET` | `ParticipationPage` (`/vote/:pollId`) |
| `/api/polls/{poll_id}/votes` | `POST` | `ParticipationPage` (`/vote/:pollId`) |

Finalize endpoint (`POST /api/meetings/{meeting_id}/confirm`) behavior:

- Purpose: move a meeting from `waiting_for_confirmation` to `finalized`.
- UI trigger: `Confirm and Finalize` button on the `MeetingConfirmation` page.
- Idempotent behavior: confirming an already `finalized` meeting returns success and does not change state.
- Errors: `404 Not Found` when meeting is missing, `409 Conflict` for invalid state transitions.

Additional auth endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`

Participant availability and integration endpoints:

- `GET /meetings/join/{public_token}` returns canonical `proposed_blocks` as `{ "start_time": "<ISO datetime>", "end_time": "<ISO datetime>" }` objects.
- Integration create flow normalizes organizer `proposed_blocks` (legacy and canonical formats) into canonical UTC datetime ranges before writing to the database.
- Integration create payload accepts at most 100 `proposed_blocks`.
- Participant availability submission accepts only a subset of organizer-proposed slots; any out-of-range block is rejected by backend subset validation.

## Dashboard Contract (`GET /api/dashboard`)

The dashboard response now includes two frontend mapping collections in addition to counters and `recent_meetings`:

- `polls`: live poll cards for dashboard voting sections.
- `calendar_meetings`: calendar entries rendered on timeline/calendar views.

### Poll visibility rules

- Included statuses: `collecting_votes`, `waiting_for_confirmation`, `confirmed`, `scheduled`.
- Excluded statuses: `draft`.
- `open_polls` equals `len(polls)`.

### Calendar semantics (current stage)

- `calendar_meetings` are derived deterministically from stored meetings (not external calendar sync).
- `start_at` is the meeting `created_at`.
- `end_at` is computed as `created_at + duration_minutes` (default `60` when missing).
- `draft` meetings are excluded.

## Auth Contract (Current)

- `POST /auth/register`
	- Request JSON: `name`, `surname`, `email`, `password`
	- Success: `201 Created` with `{ id, email }`
	- Duplicate email: `400 Bad Request`
- `POST /auth/login`
	- Request JSON: `email`, `password`
	- Success: `200 OK` with `{ access_token, token_type, user }`
	- Invalid credentials: `401 Unauthorized`
- `POST /auth/logout`
	- Requires `Authorization: Bearer <token>`
	- Success: `204 No Content`
	- Behavior: invalidates the provided session token (idempotent revoke)
	- Missing token: `401 Unauthorized`

Validation summary:

- `email` is validated and normalized (trimmed/lowercased).
- `name` and `surname` must be non-empty after trimming.
- `password` for registration must be between 8 and 128 characters.

## Environment Variables

For default Compose setup, you usually do not need to set anything manually.

Set values only when overriding defaults:

- `DATABASE_URL`
- `FRONTEND_CORS_ORIGINS`
- `BACKEND_PORT`
