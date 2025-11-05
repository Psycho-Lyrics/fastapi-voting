from fastapi import APIRouter, Depends, Request

from src.fastapi_voting.app.di.annotations import (
    VotingServiceAnnotation,
    AccessRequiredAnnotation,
    CSRFValidAnnotation
)
from src.fastapi_voting.app.schemas.voting_schema import (
    VotingSchema,
    InputCreateVotingSchema,
    InputDeleteVotingSchema,
)


# --- Конфигурация роутера ---
voting_router = APIRouter(
    prefix="/voting",
    tags=["voting"],
)

# --- Обработчики ---
@voting_router.get(path="/all", response_model=list[VotingSchema])
async def get_all_votings(
        access_payload: AccessRequiredAnnotation,
        voting_service: VotingServiceAnnotation
):
    # TODO: Полнотекстовый поиск
    # TODO: Пагинация
    # --- Работа сервиса ---
    user_id = access_payload["sub"]
    votings = await voting_service.get_all_votings(user_id)

    # --- Ответ ---
    return votings


@voting_router.post(path="/create", response_model=VotingSchema)
async def create_voting(
        access_payload: AccessRequiredAnnotation,

        voting_service: VotingServiceAnnotation,
        voting_data: InputCreateVotingSchema,
):
    # --- Первичные данные ---
    voting_data = voting_data.model_dump()
    voting_data["creator_id"] = access_payload["sub"]

    # --- Работа сервиса ---
    result = await voting_service.create_voting(voting_data)

    # --- Ответ ---
    return result


@voting_router.post(path="/delete")
async def delete_voting(
        access_payload: AccessRequiredAnnotation,

        voting_data: InputDeleteVotingSchema,
        voting_service: VotingServiceAnnotation,
):
    # --- Извлечение данных запроса ---
    voting_id = voting_data.model_dump()["id"]

    # --- Работа сервиса ---
    await voting_service.delete_voting(voting_id)

    # --- Ответ ---
    return {"message": "success"}