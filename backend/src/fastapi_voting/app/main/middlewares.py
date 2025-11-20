from fastapi import FastAPI, Request

from fastapi.middleware.cors import CORSMiddleware

from starlette.middleware.base import BaseHTTPMiddleware

from src.fastapi_voting.app.services.subservice.logging_service import LoggingService

from src.fastapi_voting.app.core.settings import get_settings


# --- Инструментарий ---
settings = get_settings()

# --- Конфигурация обработчиков ---
origins = [
    "https://localhost:5173",
    f"https://{settings.FRONTEND_IP}:{settings.FRONTEND_PORT}",
]

# --- Пользовательские обработчики ---
class LogRequestMiddleware(BaseHTTPMiddleware):
    """Middleware для логирования подробностей входящих запросов."""

    def __init__(self, app: FastAPI):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        # --- Внедрение зависимости и логирование ---
        logger = LoggingService(request=request)
        logger.input_log()

        # --- Ответ ---
        response = await call_next(request)
        return response


# --- Регистрация промежуточных обработчиков ---
def setup_middlewares(app: FastAPI):

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["Authorization", "Content-Type", "X-CSRF-Token"],
        expose_headers=["X-CSRF-Token", "WWW-Authenticate"],
    )
    app.add_middleware(LogRequestMiddleware)

