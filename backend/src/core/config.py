import os
from urllib.parse import urlparse


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


def get_cors_origins() -> list[str]:
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
