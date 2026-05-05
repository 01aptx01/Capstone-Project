"""machine_job_events resolution columns

Revision ID: b8e4f1a2c3d4
Revises: 572c8706b321
Create Date: 2026-05-04

"""
from alembic import op
import sqlalchemy as sa


revision = "b8e4f1a2c3d4"
down_revision = "572c8706b321"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "machine_job_events",
        sa.Column(
            "is_resolved",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("0"),
        ),
    )
    op.add_column(
        "machine_job_events",
        sa.Column("resolved_at", sa.DateTime(), nullable=True),
    )
    op.create_index(
        "idx_mje_state_resolved",
        "machine_job_events",
        ["state", "is_resolved"],
        unique=False,
    )


def downgrade():
    op.drop_index("idx_mje_state_resolved", table_name="machine_job_events")
    op.drop_column("machine_job_events", "resolved_at")
    op.drop_column("machine_job_events", "is_resolved")
