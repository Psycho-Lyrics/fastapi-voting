from sqlalchemy import ForeignKey, String, Enum

from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.fastapi_voting.app.models.base import Base

from src.fastapi_voting.app.core.enums import QuestionTypeEnum

class Question(Base):

    # --- Метаданные ---
    __tablename__ = 'questions'

    # --- Инициализация полей ---
    type: Mapped[QuestionTypeEnum] =  mapped_column(Enum(QuestionTypeEnum), default=QuestionTypeEnum.SINGLE)
    title: Mapped[str] = mapped_column(String(255))

    # --- Внешние ключи таблицы ---
    voting_id: Mapped[int] = mapped_column(ForeignKey('votings.id', ondelete='CASCADE'))
    #template_id: Mapped[int] = mapped_column(ForeignKey('templates.id')) TODO: Описать модель Template

    # --- ОРМ-модели ---

    # Many-to-One
    voting: Mapped["Voting"] = relationship(back_populates="questions", foreign_keys=voting_id)

    # One-to-Many
    options: Mapped[list['Option']] = relationship(back_populates="question", cascade="all, delete-orphan")
    votes: Mapped[list["Vote"]] = relationship(back_populates="question", cascade="all, delete-orphan")