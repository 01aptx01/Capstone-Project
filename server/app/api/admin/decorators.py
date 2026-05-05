"""Admin API auth placeholders — replace with JWT or session checks."""

from functools import wraps


def admin_required(f):
    """Placeholder for @jwt_required / session validation.

    Replace this with Flask-JWT-Extended or your auth stack before production.
    """

    @wraps(f)
    def decorated(*args, **kwargs):
        return f(*args, **kwargs)

    return decorated
