import sys
from pathlib import Path

from sqlalchemy import create_engine, inspect, text

sys.path.append(str(Path(__file__).resolve().parents[1]))

import src.app as app_module


def test_ensure_user_location_columns_adds_missing_columns(tmp_path):
    database_path = tmp_path / "legacy_users.db"
    engine = create_engine(f"sqlite:///{database_path}", connect_args={"check_same_thread": False})

    with engine.begin() as connection:
        connection.execute(
            text(
                "CREATE TABLE users ("
                "id VARCHAR(36) PRIMARY KEY, "
                "name VARCHAR(255) NOT NULL, "
                "surname VARCHAR(255) NOT NULL, "
                "email VARCHAR(255) NOT NULL UNIQUE, "
                "hashed_password VARCHAR(255) NOT NULL"
                ")"
            )
        )

    original_engine = app_module.engine
    app_module.engine = engine

    try:
        app_module.ensure_user_location_columns()

        inspector = inspect(engine)
        column_names = {column["name"] for column in inspector.get_columns("users")}

        assert "latitude" in column_names
        assert "longitude" in column_names
    finally:
        app_module.engine = original_engine
        engine.dispose()
