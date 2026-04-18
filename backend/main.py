from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.responses import JSONResponse

from auth.router import router as auth_router
from db import Base, engine
from meetings.router import router as meetings_router


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """Tworzy brakujace tabele przy starcie aplikacji."""
    Base.metadata.create_all(bind=engine)
    yield

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

app.include_router(auth_router)
app.include_router(meetings_router)



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
