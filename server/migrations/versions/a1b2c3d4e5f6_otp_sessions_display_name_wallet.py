"""otp_sessions, users.display_name, user_promotions

Revision ID: a1b2c3d4e5f6
Revises: d4e5f6a7b8c0, e7f8a9b0c1d2
Create Date: 2026-05-24

"""
from alembic import op
import sqlalchemy as sa

revision = "a1b2c3d4e5f6"
down_revision = ("d4e5f6a7b8c0", "e7f8a9b0c1d2")
branch_labels = None
depends_on = None


def upgrade():
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS otp_sessions (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          phone_number VARCHAR(15) NOT NULL,
          code_hash VARCHAR(64) NOT NULL,
          expires_at DATETIME NOT NULL,
          verified_at DATETIME NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          KEY idx_otp_phone_expires (phone_number, expires_at)
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        """
    )
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    user_cols = {c["name"] for c in inspector.get_columns("users")}
    if "display_name" not in user_cols:
        op.add_column("users", sa.Column("display_name", sa.String(100), nullable=True))
    tables = inspector.get_table_names()
    if "user_promotions" not in tables:
        op.execute(
            """
            CREATE TABLE user_promotions (
              id INT AUTO_INCREMENT PRIMARY KEY,
              user_id INT NOT NULL,
              promotion_id INT NOT NULL,
              status ENUM('active','used','expired') NOT NULL DEFAULT 'active',
              redeemed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              KEY idx_user_promotions_user (user_id),
              KEY idx_user_promotions_promo (promotion_id),
              CONSTRAINT fk_user_promotions_user
                FOREIGN KEY (user_id) REFERENCES users(user_id)
                ON UPDATE CASCADE ON DELETE CASCADE,
              CONSTRAINT fk_user_promotions_promotion
                FOREIGN KEY (promotion_id) REFERENCES promotions(promotion_id)
                ON UPDATE CASCADE ON DELETE RESTRICT
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
            """
        )


def downgrade():
    op.drop_table("user_promotions")
    op.drop_column("users", "display_name")
    op.drop_table("otp_sessions")
