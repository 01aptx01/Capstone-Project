"""Member loyalty users and promotions (coupon) catalog."""

from app.extensions import db


class User(db.Model):
    """Member / loyalty user (phone-based). Maps to table `users`."""

    __tablename__ = "users"

    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    phone_number = db.Column(db.String(20), unique=True, nullable=False)
    points = db.Column(db.Integer, nullable=False, default=0)
    registered_at = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)
    last_use = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(20), nullable=False, default="active")

    orders = db.relationship("Order", back_populates="member")


class Coupon(db.Model):
    """Promotional discount; maps to existing `promotions` table."""

    __tablename__ = "promotions"

    promotion_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    type = db.Column(db.String(20), nullable=False)  # fixed_amount | percent
    discount_amount = db.Column(db.Numeric(10, 2), nullable=False)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    expire_date = db.Column(db.DateTime, nullable=True)
    points_cost = db.Column(db.Integer, nullable=False, server_default="0")

    orders = db.relationship("Order", back_populates="coupon")
