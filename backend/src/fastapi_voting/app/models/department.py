from datetime import datetime, timezone

from typing import List

from sqlalchemy import ForeignKey
from sqlalchemy.types import String, TIMESTAMP
from sqlalchemy.orm import Mapped, relationship, mapped_column

from src.fastapi_voting.app.models.base import Base

from src.fastapi_voting.app.models.association.user_department_association import users_department_association_table
from src.fastapi_voting.app.models.association.voting_department_association import voting_department_association_table


class Department(Base):
    """ОРМ-модель. Описывает запись отдела"""

    # --- Метаданные ---
    __tablename__ = "departments"

    # --- Колонки таблицы ---
    name: Mapped[str] = mapped_column(String(255), unique=True)
    description: Mapped[str] = mapped_column(String(255))
    location: Mapped[str] = mapped_column(String(255))

    # --- Внешние ключи ---
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("departments.id", ondelete="SET NULL"))
    head_of_department_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), unique=True)

    # --- ОРМ-связи ---
    head_of_department: Mapped['User'] = relationship(back_populates="manage_department", foreign_keys=[head_of_department_id])

    parent: Mapped['Department'] = relationship(remote_side="Department.id", back_populates="children")

    children: Mapped[List['Department']] = relationship(back_populates="parent")

    users: Mapped[List['User']] = relationship(secondary=users_department_association_table, back_populates="departments")
    votings: Mapped[List['Voting']] = relationship(secondary=voting_department_association_table, back_populates="departments")