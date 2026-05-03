"""admin_rbac_transactions_mje_fk

Revision ID: 572c8706b321
Revises: 
Create Date: 2026-05-04 03:02:15.577591

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql


# revision identifiers, used by Alembic.
revision = '572c8706b321'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Requires base schema from database/init.sql (orders, machines, machine_job_events, …).
    op.create_table(
        "admin_users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )

    op.create_table(
        "roles",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=64), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    op.create_table(
        "admin_user_role",
        sa.Column("admin_user_id", sa.Integer(), nullable=False),
        sa.Column("role_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["admin_user_id"],
            ["admin_users.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["role_id"],
            ["roles.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("admin_user_id", "role_id"),
    )

    op.create_table(
        "transactions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("order_id", sa.Integer(), nullable=False),
        sa.Column("provider", sa.String(length=32), nullable=False),
        sa.Column("provider_ref", sa.String(length=128), nullable=True),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column(
            "currency",
            sa.String(length=3),
            nullable=False,
            server_default="THB",
        ),
        sa.Column("fee_amount", sa.Numeric(10, 2), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("raw_payload_json", mysql.JSON(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.ForeignKeyConstraint(
            ["order_id"],
            ["orders.order_id"],
            onupdate="CASCADE",
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_transactions_order_id", "transactions", ["order_id"], unique=False)
    op.create_index(
        "ix_transactions_provider_ref", "transactions", ["provider_ref"], unique=False
    )

    op.create_foreign_key(
        "fk_machine_job_events_machine_code",
        "machine_job_events",
        "machines",
        ["machine_code"],
        ["machine_code"],
        onupdate="CASCADE",
        ondelete="RESTRICT",
    )


def downgrade():
    op.drop_constraint(
        "fk_machine_job_events_machine_code",
        "machine_job_events",
        type_="foreignkey",
    )
    op.drop_index("ix_transactions_provider_ref", table_name="transactions")
    op.drop_index("ix_transactions_order_id", table_name="transactions")
    op.drop_table("transactions")
    op.drop_table("admin_user_role")
    op.drop_table("roles")
    op.drop_table("admin_users")
