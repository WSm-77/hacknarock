import sys

from sqlalchemy import text

from src.database.session import engine

def clear_db() -> None:
    with engine.begin() as connection:
        connection.execute(text("DROP SCHEMA public CASCADE"))
        connection.execute(text("CREATE SCHEMA public"))
