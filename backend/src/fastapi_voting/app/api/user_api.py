import logging

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, status, Request
from fastapi.responses import JSONResponse

from src.fastapi_voting.app.core.settings import get_settings

from src.fastapi_voting.app.di.annotations import (
    UserServiceAnnotation,

    TokenServiceAnnotation,

    AccessRequiredAnnotation,
    RefreshRequiredAnnotation,
    CSRFValidAnnotation
)

from src.fastapi_voting.app.schemas.user_schema import InputCreateUserSchema, OutputCreateUserSchema
from src.fastapi_voting.app.schemas.user_schema import InputLoginUserSchema, ResponseLoginUserSchema, UserSchema
from src.fastapi_voting.app.schemas.user_schema import OutputRefreshUserSchema


# --- Инициализация первичных данных и вспомогательных инструментов---
logger = logging.getLogger("fastapi-voting")
settings = get_settings()


# --- Конфигурация обработчика маршрутов, связанных с пользователями ---
user_router = APIRouter(
    prefix="/user",
    tags=["user"]
)


# --- Регистрация пользователя ---
@user_router.post("/register", response_model=OutputCreateUserSchema)
async def user_register(
        data: InputCreateUserSchema,
        user_service: UserServiceAnnotation
):
    registered_user = await user_service.register(data)
    return registered_user


# --- Авторизация пользователя ---
@user_router.post("/login", response_model=ResponseLoginUserSchema)
async def user_login(
        data: InputLoginUserSchema,

        user_service: UserServiceAnnotation,
        token_service: TokenServiceAnnotation
):
    # TODO: Привязка токенов к сессии. Рассмотреть.
    # --- Инициализация данных ---
    remember_flag = data.model_dump()["remember_me"]
    cookie_expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_EXPIRE_DAYS)

    # --- Работа бизнес-сервиса ---
    logined_user = await user_service.login(data)

    # --- Генерация токенов ---
    tokens = token_service.create_tokens(logined_user.id, remember_flag)
    csrf_token, signed_csrf = token_service.create_csrf()

    # --- Формирование ответа сервера ---
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
@user_router.post("/access-logout")
async def user_acs_logout(
        access_payload: AccessRequiredAnnotation,
        token_service : TokenServiceAnnotation,
):
    # --- Работа сервиса ---
    await token_service.revoke_token(access_payload)

    # --- Ответ ---
    return {"message": "access revoked"}


@user_router.post("/refresh-logout")
async def user_ref_logout(
        csrf_is_valid: CSRFValidAnnotation,
        refresh_payload: RefreshRequiredAnnotation,
        token_service : TokenServiceAnnotation,
):
    # --- Работа сервиса ---
    await token_service.revoke_token(refresh_payload)

    # --- Ответ ---
    return {"message": "refresh revoked"}


# --- Обновление сессии ---
@user_router.post("/refresh", response_model=OutputRefreshUserSchema)
async def user_refresh(
        csrf_is_valid: CSRFValidAnnotation,
        refresh_payload: RefreshRequiredAnnotation,
        token_service : TokenServiceAnnotation,
):
    # --- Первичные данные ---
    user_id = refresh_payload["sub"]
    cookie_expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_EXPIRE_DAYS)

    # --- Ротация старого refresh-токена ---
    await token_service.revoke_token(refresh_payload)

    # --- Генерация токенов ---
    tokens = token_service.create_tokens(user_id, refresh=True)
    csrf_token, signed_csrf = token_service.create_csrf()

    # --- Формирование ответа ---
    content = {"access_token": tokens["access_token"]}

    response = JSONResponse(content=content)
    response.headers["X-CSRF-Token"] = csrf_token
    response.set_cookie(key="fastapi-csrf-token", value=signed_csrf, httponly=True, expires=cookie_expire)
    response.set_cookie(key="refresh-token", value=tokens["refresh_token"], httponly=True, expires=cookie_expire)

    # --- Ответ ---
    return response
