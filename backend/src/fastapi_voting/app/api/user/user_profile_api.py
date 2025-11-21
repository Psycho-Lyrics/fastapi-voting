from uuid import UUID

from fastapi import APIRouter, status, Header

from src.fastapi_voting.app.core.settings import get_settings

from src.fastapi_voting.app.di.annotations import (
    UserServiceAnnotation,

    AccessRequiredAnnotation,
)
from src.fastapi_voting.app.schemas.user_schema import (
    UserSchema,
    InputChangeCredentialsSchema,
    InputChangePasswordSchema
)

# --- Инструментарий и обработчик ---
settings = get_settings()

user_profile_router = APIRouter(
    prefix="/profile",
    tags=["Личный кабинет пользователя"]
)


# -- Смена учётных данных ---
@user_profile_router.post("/change-credentials", response_model=UserSchema, status_code=status.HTTP_200_OK)
async def change_user_credentials(
        user_service: UserServiceAnnotation,
        access_payload: AccessRequiredAnnotation,

        data: InputChangeCredentialsSchema,

        access_token = Header(default=None, description="JWT-Токен"),
):
    # Работа со входными данными запроса и работа сервиса
    user_id = access_payload["sub"]
    user = await user_service.change_credentials(data, user_id)

    # Ответ
    return user


# -- Смена пароля ---
@user_profile_router.post("/change-password", status_code=status.HTTP_200_OK)
async def change_user_password_init(
        access_payload: AccessRequiredAnnotation,
        data: InputChangePasswordSchema,

        user_service: UserServiceAnnotation,

        access_token = Header(default=None, description="JWT-Токен"),
):
    # Первичные данные
    data = data.model_dump()
    user_id = access_payload["sub"]

    # Работа сервиса
    await user_service.init_change_password(data, user_id)

    return {"message": "email message sent"}


@user_profile_router.post("/change-password-confirm/{uuid}", status_code=status.HTTP_200_OK)
async def change_user_password_confirm(
        access_token_payload: AccessRequiredAnnotation,
        user_service: UserServiceAnnotation,

        uuid: UUID,
        token=Header(default=None, description="JWT-токен"),
):
    # Данные запроса
    user_id = access_token_payload["sub"]

    # Работа сервиса
    await user_service.confirm_change_password(user_id=user_id, uuid=uuid)

    # Ответ
    return {"message": "password changed"}


