from fastapi import APIRouter, Query, Header

from src.fastapi_voting.app.di.annotations import (
    VotingServiceAnnotation,
    AccessRequiredAnnotation,
)
from src.fastapi_voting.app.schemas.voting_schema import (
    VotingSchema,
    InputCreateVotingSchema,
    InputDeleteVotingSchema,
    ResponseAllVotingsSchema,
)


# --- Конфигурация роутера ---
voting_router = APIRouter(
    prefix="/voting",
    tags=["voting"],
)

# --- Обработчики ---
@voting_router.get(path="/all", response_model=ResponseAllVotingsSchema)
async def get_all_votings(
        access_payload: AccessRequiredAnnotation,
        voting_service: VotingServiceAnnotation,

        find: str = Query(default=None, description="Строковое условие поиска."),
        archived: bool = Query(default=False, description="Булево условие статуса голосования."),
        page: int = Query(default=1, description="Целочисленное значение текущей страницы для пагинации."),

        access_token: str = Header(default=None, description="JWT-токен"),
):
    # --- Данные запроса ---
    user_id = access_payload["sub"]

    # --- Работа сервиса ---
    response = await voting_service.get_all_votings(user_id=user_id, page=page, find=find, archived=archived)

    # --- Ответ ---
    return response


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