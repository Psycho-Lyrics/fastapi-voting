from sqlalchemy import ForeignKey, String

from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.fastapi_voting.app.models.base import Base


class Option(Base):
    # --- Метаданные ---
    __tablename__ = 'options'

    # --- Инициализация полей ---
    option: Mapped[str] = mapped_column(String(255))

    # --- Внешние ключи таблицы ---
    question_id: Mapped[int] = mapped_column(ForeignKey('questions.id', ondelete='CASCADE'))
    voting_id: Mapped[int] = mapped_column(ForeignKey('votings.id'))

    # --- ОРМ-модели ---

    # Many-to-One
    voting: Mapped["Voting"] = relationship(back_populates="options", foreign_keys=voting_id)
    question: Mapped["Question"] = relationship(back_populates="options", foreign_keys=question_id)

    # One-to-Many
    votes: Mapped[list["Vote"]] = relationship(back_populates="option", cascade="all, delete-orphan")