# HackNaRock - Team Meeting Scheduler

HackNaRock helps teams create meetings, collect participation votes, and monitor meeting state from a single web app.

## Local Stack (Docker Compose)

`docker-compose.yml` now runs all local services together:

- `frontend` (Vite, default: `http://localhost:5173`)
- `backend` (FastAPI, default: `http://localhost:8000`)
- `postgres` (default: `localhost:5432`)

Start locally:

```bash
docker compose up --build
```

## Frontend to API Integration

Key API endpoints currently used by the frontend:

| Endpoint | Method | Used by frontend page | Purpose |
|---|---|---|---|
| `/api/dashboard` | `GET` | `/` (`Dashboard`) | Fetch dashboard counters and recent meetings |
| `/api/meetings` | `POST` | `/create` (`MeetingCreationWizard`) | Create a meeting and voting poll |
| `/api/polls/{poll_id}` | `GET` | `/vote/:pollId` (`ParticipationPage`) | Load poll details and options |
| `/api/polls/{poll_id}/votes` | `POST` | `/vote/:pollId` (`ParticipationPage`) | Submit a vote |

Authentication endpoints are used by the logging page (`/login` and `/logging`):

- `POST /auth/register` requires `name`, `surname`, `email`, `password`.
- `POST /auth/login` requires `email`, `password`.
- `POST /auth/logout` requires a Bearer token, invalidates that token server-side, and returns `204 No Content`.
- `/login` and `/logging` render the same UI with mode switching (`login`/`register`).
- Frontend logout uses `POST /auth/logout`, clears local auth session data, and redirects to `/login`.
- Registration duplicate email returns `400` and is surfaced as an email field error.
- Invalid auth payloads (missing/invalid fields) are rejected by backend validation.

## Environment Variables

No extra variables are required for default local development because Compose provides safe defaults.

Only set variables when you need custom ports, DB credentials, CORS origins, or API base URL (for example `BACKEND_PORT`, `FRONTEND_PORT`, `POSTGRES_*`, `FRONTEND_CORS_ORIGINS`, `VITE_API_BASE_URL`).
