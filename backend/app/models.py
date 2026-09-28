from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class FieldConfiguration(Base):
    __tablename__ = "field_configurations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    field_type: Mapped[str] = mapped_column(String(20), nullable=False)
    required: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    options: Mapped[str | None] = mapped_column(Text, nullable=True)

    values = relationship(
        "MachineValue",
        back_populates="field",
        cascade="all, delete-orphan",
    )


class MachineRecord(Base):
    __tablename__ = "machine_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    values = relationship(
        "MachineValue",
        back_populates="machine",
        cascade="all, delete-orphan",
    )


class MachineValue(Base):
    __tablename__ = "machine_values"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    machine_id: Mapped[int] = mapped_column(
        ForeignKey("machine_records.id"),
        nullable=False,
    )
    field_id: Mapped[int] = mapped_column(
        ForeignKey("field_configurations.id"),
        nullable=False,
    )
    value: Mapped[str] = mapped_column(Text, nullable=False)

    __table_args__ = (
        UniqueConstraint(
            "machine_id",
            "field_id",
            name="uq_machine_field",
        ),
    )

    machine = relationship(
        "MachineRecord",
        back_populates="values",
    )

    field = relationship(
        "FieldConfiguration",
        back_populates="values",
    )