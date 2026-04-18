from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.api_integration.router import router as integration_router
from src.auth.router import router as auth_router
from src.core.config import get_cors_origins
from src.meetings.router import router as meetings_router
from src.scripts.create_db import create_db


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
