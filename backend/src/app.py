import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.api_integration.router import router as integration_router
from src.auth.router import router as auth_router
from src.meetings.router import router as meetings_router
from src.scripts.create_db import create_db


def get_cors_origins() -> list[str]:
    """Return allowed frontend origins for local/dev CORS policy."""
    raw_origins = os.getenv("FRONTEND_CORS_ORIGINS", "")
    default_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ]

    if not raw_origins.strip():
        return default_origins

    parsed: list[str] = []
    for candidate in (item.strip() for item in raw_origins.split(",")):
        if not candidate:
            continue
        if candidate == "*":
            continue
        if not (candidate.startswith("http://") or candidate.startswith("https://")):
            continue
        parsed.append(candidate)

    return parsed or default_origins


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """Create missing tables during app startup."""
    create_db()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="HackNaRock API",
        description="Backend API for HackNaRock",
        version="0.1.0",
        lifespan=lifespan,
        openapi_tags=[
            {
                "name": "Authentication",
                "description": "Rejestracja i logowanie użytkowników.",
            },
            {
                "name": "Meetings",
                "description": "Operacje związane ze spotkaniami.",
            },
        ],
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=get_cors_origins(),
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "Accept"],
    )

    app.include_router(auth_router)
    app.include_router(meetings_router)
    app.include_router(integration_router)

    @app.get("/")
    async def root() -> JSONResponse:
        return JSONResponse(
            {
                "message": "Witaj w HackNaRock API!",
                "status": "ok",
                "version": "0.1.0",
            }
        )

    @app.get("/health")
    async def health_check() -> JSONResponse:
        return JSONResponse({"status": "healthy"})

    return app


app = create_app()
