from fastapi import APIRouter, Query, Header, status

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
    tags=["Голосования"],
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
    response = await voting_service.get_all_votings(user_id=access_payload["sub"], page=page, find=find, archived=archived)
    return response


@voting_router.post(path="/create", response_model=VotingSchema, status_code=status.HTTP_201_CREATED)
async def create_voting(
        access_payload: AccessRequiredAnnotation,

        voting_service: VotingServiceAnnotation,
        voting_data: InputCreateVotingSchema,

        access_token: str = Header(default=None, description="JWT-токен"),
):
    result = await voting_service.create_voting(voting_data=voting_data, creator_id=access_payload["sub"])
    return result


@voting_router.post(path="/delete")
async def delete_voting(
        access_payload: AccessRequiredAnnotation,

        voting_data: InputDeleteVotingSchema,
        voting_service: VotingServiceAnnotation,

        access_token: str = Header(default=None, description="JWT-токен"),
):
    await voting_service.delete_voting(voting_data=voting_data)
    return {"message": "success"}