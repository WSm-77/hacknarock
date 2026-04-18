from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import os
from urllib.parse import urlparse

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.auth.router import router as auth_router
try:
    from backend.src.api_integration.router import router as integration_router
    from backend.src.auth.router import router as auth_router
    from backend.src.meetings.router import router as meetings_router
except ModuleNotFoundError:
    from src.api_integration.router import router as integration_router
    from src.auth.router import router as auth_router
    from src.meetings.router import router as meetings_router

from db import Base, engine
from src.meetings.router import router as meetings_router


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """Tworzy brakujace tabele przy starcie aplikacji."""
    Base.metadata.create_all(bind=engine)
    yield


def _get_cors_origins() -> list[str]:
    def _is_valid_origin(origin: str) -> bool:
        if origin == "*":
            # Wildcard origin is unsafe with credentialed requests.
            return False

        parsed = urlparse(origin)
        if parsed.scheme not in {"http", "https"}:
            return False

        if not parsed.netloc or "*" in parsed.netloc:
            return False

        return True

    raw_origins = os.getenv("FRONTEND_CORS_ORIGINS")
    if raw_origins:
        origins = [
            origin.strip()
            for origin in raw_origins.split(",")
            if origin.strip() and _is_valid_origin(origin.strip())
        ]
        if origins:
            return origins

    return [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ]

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
    allow_origins=_get_cors_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

app.include_router(auth_router)
app.include_router(meetings_router)
app.include_router(integration_router)



@app.get("/")
async def root() -> JSONResponse:
    """
    Root endpoint that returns a welcome message.

    Returns:
        JSONResponse: Welcome message with API info
    """
    return JSONResponse({
        "message": "Witaj w HackNaRock API!",
        "status": "ok",
        "version": "0.1.0"
    })


@app.get("/health")
async def health_check() -> JSONResponse:
    """
    Health check endpoint.

    Returns:
        JSONResponse: Health status
    """
    return JSONResponse({
        "status": "healthy"
    })


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
