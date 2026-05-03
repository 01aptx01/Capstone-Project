import os
from urllib.parse import quote_plus


def build_sqlalchemy_database_uri() -> str:
    """MySQL URI aligned with app/db_config/db.py env vars."""
    host = os.getenv("DB_HOST", "localhost")
    user = quote_plus(os.getenv("DB_USER", "root"))
    password = quote_plus(os.getenv("DB_PASSWORD", ""))
    database = os.getenv("DB_NAME", "vending")
    return f"mysql+mysqlconnector://{user}:{password}@{host}/{database}"
