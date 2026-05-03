"""WSGI / Flask CLI entry: set FLASK_APP=wsgi:app for migrations."""

from app.factory import create_app

app = create_app()
