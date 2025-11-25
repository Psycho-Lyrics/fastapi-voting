from datetime import datetime, timezone

from sqlalchemy import TIMESTAMP, func
from sqlalchemy.orm import DeclarativeBase, mapped_column, Mapped


class Base(DeclarativeBase):
    """ORM-модель. Описывает родительский класс для всех остальных"""

    # --- Метаданные ---
    __abstract__ = True

    # --- Общие колонки таблиц ---
    id: Mapped[int] = mapped_column(primary_key=True)

    created_at: Mapped[timezone] = mapped_column(TIMESTAMP(timezone=True), default=func.now())
    updated_at: Mapped[timezone] = mapped_column(TIMESTAMP(timezone=True), default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
