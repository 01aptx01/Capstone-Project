"""machines secret_token_hash and is_online

Revision ID: e7f8a9b0c1d2
Revises: c2a3b4c5d6e7
Create Date: 2026-05-05

"""
from alembic import op
import sqlalchemy as sa


revision = "e7f8a9b0c1d2"
down_revision = "c2a3b4c5d6e7"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "machines",
        sa.Column("secret_token_hash", sa.String(length=255), nullable=True),
    )
    op.add_column(
        "machines",
        sa.Column(
            "is_online",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("0"),
        ),
    )


def downgrade():
    op.drop_column("machines", "is_online")
    op.drop_column("machines", "secret_token_hash")
