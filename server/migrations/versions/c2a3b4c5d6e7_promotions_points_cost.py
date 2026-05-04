"""promotions.points_cost for point-redeem coupons

Revision ID: c2a3b4c5d6e7
Revises: b8e4f1a2c3d4
Create Date: 2026-05-04

"""
from alembic import op
import sqlalchemy as sa


revision = "c2a3b4c5d6e7"
down_revision = "b8e4f1a2c3d4"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "promotions",
        sa.Column("points_cost", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade():
    op.drop_column("promotions", "points_cost")
