from fastapi import FastAPI

from src.fastapi_voting.app.core.settings import get_settings

from src.fastapi_voting.app.main.middlewares import setup_middlewares
from src.fastapi_voting.app.main.handlers import setup_handlers

from src.fastapi_voting.app.api.user.user_auth_api import user_auth_router
from src.fastapi_voting.app.api.user.user_profile_api import user_profile_router

from src.fastapi_voting.app.api.department.department_api import department_router
from src.fastapi_voting.app.api.voting.voting_api import voting_router


# --- Инструментарий ---
settings = get_settings()


# --- Инициализация приложения ---
fastapi_app = FastAPI(
    title='FastAPI-Voting',
    version='1.0',
    description='FastAPI-Voting',
    docs_url='/docs',
    redoc_url='/redoc',
)

# --- Регистрация Middleware и Handlers ---
setup_middlewares(fastapi_app)
setup_handlers(fastapi_app)

# --- Вторичные данные ---
v1_url_prefix = '/api/v1'

# --- Регистрация обработчиков маршрутов ---
fastapi_app.include_router(router=user_auth_router, prefix=v1_url_prefix)
fastapi_app.include_router(router=user_profile_router, prefix=v1_url_prefix)

fastapi_app.include_router(router=department_router, prefix=v1_url_prefix)
fastapi_app.include_router(router=voting_router, prefix=v1_url_prefix)
