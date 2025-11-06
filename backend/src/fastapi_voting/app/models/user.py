import argon2

from datetime import timezone, datetime

from typing import List

from sqlalchemy import ForeignKey, String, BINARY, Enum, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.fastapi_voting.app.models.base import Base

from src.fastapi_voting.app.models.association.user_voting_registered_association import users_voting_registered_association_table
from src.fastapi_voting.app.models.association.user_department_association import users_department_association_table

from src.fastapi_voting.app.core.enums import RolesEnum


class User(Base):
    """ОРМ-модель. Описывает запись о пользователе"""

    # --- Метаданные ---
    __tablename__ = "users"

    # --- Столбцы таблицы ---
    first_name: Mapped[str] = mapped_column(String(255))
    last_name: Mapped[str] = mapped_column(String(255))
    surname: Mapped[str | None] = mapped_column(String(255))

    phone: Mapped[str] = mapped_column(String(25), unique=True)
    email: Mapped[str] = mapped_column(String(120), unique=True)

    password_hash: Mapped[str] = mapped_column(String(255))
    is_email_verified: Mapped[bool] = mapped_column(default=False)

    role: Mapped[RolesEnum] = mapped_column(Enum(RolesEnum), default=RolesEnum.EMPLOYEE)

    created_at: Mapped[timezone] = mapped_column(TIMESTAMP(timezone=True), default=datetime.now(timezone.utc))
    updated_at: Mapped[timezone] = mapped_column(TIMESTAMP(timezone=True), default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))

    # --- ORM-связи ---
    manage_department: Mapped['Department'] = relationship(back_populates="head_of_department")

    creator_votings: Mapped[List['Voting']] = relationship(back_populates="creator")
    votes_made: Mapped[List["Vote"]] = relationship(back_populates="author")

    departments: Mapped[List['Department']] = relationship(secondary=users_department_association_table, back_populates="users")
    votings: Mapped[List['Voting']] = relationship(secondary=users_voting_registered_association_table, back_populates="registered_users")


    def set_hash_password(self, password: str) -> None:
        ph = argon2.PasswordHasher()
        self.password_hash = ph.hash(password)

    def verify_password(self, password: str) -> bool:
        ph = argon2.PasswordHasher()

        try:
            return ph.verify(self.password_hash, password)
        except argon2.exceptions.VerifyMismatchError:
            return False