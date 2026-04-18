"""Compatibility shim for legacy imports.

Prefer importing from `src.database.session`.
"""

from src.database.session import Base, DATABASE_URL, SessionLocal, engine, get_db

__all__ = ["Base", "DATABASE_URL", "SessionLocal", "engine", "get_db"]
