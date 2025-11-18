from fastapi import Request, status, FastAPI

from fastapi.responses import JSONResponse

from src.fastapi_voting.app.core.exception.base_exc import AppException

from src.fastapi_voting.app.di.dependencies.logging_di import LoggingExceptionDI


# --- Хэндлеры ---
def setup_handlers(app: FastAPI):
    @app.exception_handler(AppException)
    async def http_exception_handler(request: Request, exc: AppException) -> JSONResponse:
        """Обработчик ошибок. Рассчитан на обработку и логирование пользовательских исключений класса AppException."""

        # --- Внедрение зависимости ---
        logger = LoggingExceptionDI("HTTP")(request=request)

        # --- Логирование ---
        logger.error(detail=exc.log_detail)

        # --- Формирование ответа ---
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.response_detail},
            headers=exc.headers,
        )

    @app.exception_handler(Exception)
    async def another_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        """Обработчик ошибок. Рассчитан на обработку и логирование непредвиденных ошибок."""

        # --- Внедрение зависимости ---
        logger = LoggingExceptionDI("HTTP")(request=request)

        # --- Логирование ---
        logger.error(detail=exc)

        # --- Формирование ответа ---
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal Server Error"},
        )