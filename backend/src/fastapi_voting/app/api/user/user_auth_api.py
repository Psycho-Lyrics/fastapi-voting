from datetime import datetime, timedelta, timezone

from uuid import UUID

from fastapi import APIRouter, status, Header
from fastapi.responses import JSONResponse

from src.fastapi_voting.app.core.settings import get_settings

from src.fastapi_voting.app.di.annotations import (
    UserServiceAnnotation,
    TokenServiceAnnotation,

    AccessRequiredAnnotation,
    RefreshRequiredAnnotation,
    CSRFValidAnnotation,

    EmailRequestLimitAnnotation
)
from src.fastapi_voting.app.schemas.user_schema import (
    UserSchema,
    InputCreateUserSchema,
    InputLoginUserSchema, ResponseLoginUserSchema,
    OutputRefreshUserSchema,
    OutputSentEmailSchema
)

# --- Инструментарий и обработчик ---
settings = get_settings()

user_auth_router = APIRouter(
    prefix="/auth",
    tags=["Авторизация"]
)

# --- Регистрация пользователя ---
@user_auth_router.post("/register", status_code=status.HTTP_200_OK, response_model=OutputSentEmailSchema)
async def user_register_init(
        rate_minutes: EmailRequestLimitAnnotation,

        data: InputCreateUserSchema,
        user_service: UserServiceAnnotation,
):
    await user_service.init_register(data)
    return OutputSentEmailSchema(message="email message sent", rate_minutes=rate_minutes)


@user_auth_router.post("/register-confirm/{uuid}", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
async def user_register_confirm(
        user_service: UserServiceAnnotation,
        uuid: UUID,
):
    user = await user_service.confirm_register(uuid=uuid)
    return user


# --- Авторизация пользователя ---
@user_auth_router.post("/login", response_model=ResponseLoginUserSchema, status_code=status.HTTP_200_OK)
async def user_login(
        data: InputLoginUserSchema,

        user_service: UserServiceAnnotation,
        token_service: TokenServiceAnnotation
):
    # TODO: Привязка токенов к сессии. Рассмотреть.
    # Инициализация данных
    remember_flag = data.model_dump()["remember_me"]
    cookie_expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_EXPIRE_DAYS)

    # Работа бизнес-сервиса
    logined_user = await user_service.login(data)

    # Генерация токенов
    tokens = token_service.create_tokens(user_id=logined_user.id, refresh=remember_flag)
    csrf_token, signed_csrf = token_service.create_csrf()

    # Формирование ответа сервера
    content: dict = ResponseLoginUserSchema(
        user=UserSchema.model_validate(logined_user),
        access_token=tokens["access_token"]
    ).model_dump(mode="json")

    response = JSONResponse(content=content)
    response.headers["X-CSRF-Token"] = csrf_token
    response.set_cookie(key="fastapi-csrf-token", value=signed_csrf, httponly=True, expires=cookie_expire, secure=True, samesite="none")
    response.set_cookie(key="refresh-token", value=tokens["refresh_token"], httponly=True, expires=cookie_expire, secure=True, samesite="none")

    return response


# --- Выход из сессии ---
@user_auth_router.post("/access-logout", status_code=status.HTTP_200_OK)
async def user_acs_logout(
        access_payload: AccessRequiredAnnotation,
        token_service : TokenServiceAnnotation,

        access_token = Header(default=None, description="JWT-Токен")
):
    await token_service.revoke_token(access_payload)
    return {"message": "success"}


@user_auth_router.post("/refresh-logout", status_code=status.HTTP_200_OK)
async def user_ref_logout(
        csrf_is_valid: CSRFValidAnnotation,
        refresh_payload: RefreshRequiredAnnotation,
        token_service : TokenServiceAnnotation,

        csrf_token = Header(default=None, description="CSRF-Токен")
):
    await token_service.revoke_token(refresh_payload)
    return {"message": "success"}


# --- Обновление сессии ---
@user_auth_router.post("/refresh", response_model=OutputRefreshUserSchema, status_code=status.HTTP_200_OK)
async def user_refresh(
        csrf_is_valid: CSRFValidAnnotation,
        refresh_payload: RefreshRequiredAnnotation,
        token_service : TokenServiceAnnotation,

        csrf_token=Header(default=None, description="CSRF-Токен")
):
    # Первичные данные
    user_id = refresh_payload["sub"]
    cookie_expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_EXPIRE_DAYS)

    # Ротация старого refresh-токена
    await token_service.revoke_token(refresh_payload)

    # Генерация токенов
    tokens = token_service.create_tokens(user_id, refresh=True)
    csrf_token, signed_csrf = token_service.create_csrf()

    # Формирование ответа
    content = {"access_token": tokens["access_token"]}

    response = JSONResponse(content=content)
    response.headers["X-CSRF-Token"] = csrf_token
    response.set_cookie(key="fastapi-csrf-token", value=signed_csrf, httponly=True, expires=cookie_expire, secure=True, samesite="none")
    response.set_cookie(key="refresh-token", value=tokens["refresh_token"], httponly=True, expires=cookie_expire, secure=True, samesite="none")

    # Ответ
    return response