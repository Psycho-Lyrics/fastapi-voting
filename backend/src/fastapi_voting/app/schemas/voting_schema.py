from datetime import datetime

from pydantic import BaseModel


# --- Общая схема со всеми полями ---
class VotingSchema(BaseModel):
    id: int
    title: str
    theme: str
    public: bool
    quorum: int

    registration_start: datetime
    registration_end: datetime

    voting_start: datetime
    voting_end: datetime

    class Config:
        from_attributes = True


# --- Схемы для создания голосования ---
class InputCreateVotingSchema(BaseModel):
    title: str
    theme: str
    public: bool
    quorum: int

    registration_start: datetime
    registration_end: datetime

    voting_start: datetime
    voting_end: datetime


# --- Схема для удаления пользования ---
class InputDeleteVotingSchema(BaseModel):
    id: int


# --- Схема для отображения всех голосований ---
class ResponseAllVotingsSchema(BaseModel):
    items: list[VotingSchema]
    pagination: dict[str, bool | int]
