"""promotions.max_uses — limit total redemptions (0 = unlimited)

Revision ID: d4e5f6a7b8c0
Revises: c2a3b4c5d6e7
Create Date: 2026-05-05

"""
from alembic import op
import sqlalchemy as sa


revision = "d4e5f6a7b8c0"
down_revision = "c2a3b4c5d6e7"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "promotions",
        sa.Column("max_uses", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade():
    op.drop_column("promotions", "max_uses")
