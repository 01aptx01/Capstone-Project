"""Machines, inventory slots, and hardware event log."""

from app.extensions import db


class Machine(db.Model):
    __tablename__ = "machines"

    machine_code = db.Column(db.String(20), primary_key=True)
    location = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), nullable=False, default="online")
    last_active = db.Column(db.DateTime, nullable=True)
    secret_token_hash = db.Column(db.String(255), nullable=True)
    is_online = db.Column(db.Boolean, nullable=False, default=False)

    slots = db.relationship("MachineSlot", back_populates="machine", cascade="all, delete-orphan")
    orders = db.relationship("Order", back_populates="machine")
    events = db.relationship("MachineEvent", back_populates="machine")


class Product(db.Model):
    __tablename__ = "products"

    product_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(100), nullable=True)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    image_url = db.Column(db.String(200), nullable=True)
    heating_time = db.Column(db.Integer, nullable=True)
    category = db.Column(db.String(20), nullable=False, default="meat")

    slots = db.relationship("MachineSlot", back_populates="product")
    order_items = db.relationship("OrderItem", back_populates="product")


class MachineSlot(db.Model):
    __tablename__ = "machine_slots"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    machine_code = db.Column(
        db.String(20),
        db.ForeignKey("machines.machine_code", onupdate="CASCADE", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    slot_number = db.Column(db.Integer, nullable=False)
    product_id = db.Column(
        db.Integer,
        db.ForeignKey("products.product_id", onupdate="CASCADE", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    quantity = db.Column(db.Integer, nullable=False, default=0)

    machine = db.relationship("Machine", back_populates="slots")
    product = db.relationship("Product", back_populates="slots")

    __table_args__ = (db.UniqueConstraint("machine_code", "slot_number", name="uq_machine_slot"),)


class MachineEvent(db.Model):
    """Hardware / job events; maps to `machine_job_events`."""

    __tablename__ = "machine_job_events"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    machine_code = db.Column(
        db.String(20),
        db.ForeignKey("machines.machine_code", onupdate="CASCADE", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    job_id = db.Column(db.String(64), nullable=False, index=True)
    order_charge_id = db.Column(db.String(64), nullable=True, index=True)
    event_type = db.Column(db.String(50), nullable=False)
    state = db.Column(db.String(50), nullable=True)
    seq = db.Column(db.Integer, nullable=False)
    payload_json = db.Column(db.JSON, nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)
    is_resolved = db.Column(db.Boolean, nullable=False, default=False)
    resolved_at = db.Column(db.DateTime, nullable=True)

    machine = db.relationship("Machine", back_populates="events")

    __table_args__ = (db.UniqueConstraint("job_id", "seq", name="uq_mje_job_seq"),)
