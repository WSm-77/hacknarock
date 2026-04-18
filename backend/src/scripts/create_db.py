from src.database.session import Base, engine

def create_db() -> None:
    """Create the database schema."""
    Base.metadata.create_all(bind=engine)
