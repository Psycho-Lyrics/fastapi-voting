from fastapi import FastAPI, Request

from fastapi.middleware.cors import CORSMiddleware

from starlette.middleware.base import BaseHTTPMiddleware

from src.fastapi_voting.app.di.dependencies.logging_di import LoggingExceptionDI


# --- Конфигурация обработчиков ---
origins = [
    "https://localhost:5173"
]

# --- Пользовательские обработчики ---
class LogRequestMiddleware(BaseHTTPMiddleware):
    """Middleware для логирования подробностей входящих запросов."""

    def __init__(self, app: FastAPI):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        # --- Внедрение зависимости и логирование ---
        logger = LoggingExceptionDI("HTTP")(request=request)
        logger.info(detail="")

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

