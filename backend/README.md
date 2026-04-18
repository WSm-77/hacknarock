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
| `/api/polls/{poll_id}` | `GET` | `ParticipationPage` (`/vote/:pollId`) |
| `/api/polls/{poll_id}/votes` | `POST` | `ParticipationPage` (`/vote/:pollId`) |

Additional auth endpoints:

- `POST /auth/register`
- `POST /auth/login`

## Environment Variables

For default Compose setup, you usually do not need to set anything manually.

Set values only when overriding defaults:

- `DATABASE_URL`
- `FRONTEND_CORS_ORIGINS`
- `BACKEND_PORT`
