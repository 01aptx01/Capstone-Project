"""Best-effort DDL for dev / legacy DBs when migrations were not applied."""

from __future__ import annotations

import sqlalchemy as sa


def ensure_promotions_max_uses(engine: sa.Engine) -> None:
    """Add promotions.max_uses if missing (e.g. volume created before migration)."""
    insp = sa.inspect(engine)
    if not insp.has_table("promotions"):
        return
    col_names = {c["name"] for c in insp.get_columns("promotions")}
    if "max_uses" in col_names:
        return
    dialect = engine.dialect.name
    if dialect == "mysql":
        stmt = "ALTER TABLE promotions ADD COLUMN max_uses INT NOT NULL DEFAULT 0"
    elif dialect == "sqlite":
        stmt = (
            "ALTER TABLE promotions ADD COLUMN max_uses INTEGER NOT NULL DEFAULT 0"
        )
    else:
        return
    with engine.begin() as conn:
        conn.execute(sa.text(stmt))
