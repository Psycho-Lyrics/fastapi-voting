from fastapi import Request, status, FastAPI

from fastapi.responses import JSONResponse

from src.fastapi_voting.app.core.exception.base_exc import AppException, AnomalyException

from src.fastapi_voting.app.services.subservice.logging_service import LoggingService


# --- Хэндлеры ---
def setup_handlers(app: FastAPI):
    @app.exception_handler(AppException)
    async def http_exception_handler(request: Request, exc: AppException) -> JSONResponse:
        """Обработчик ошибок. Рассчитан на обработку и логирование пользовательских исключений класса AppException."""

        # --- Внедрение зависимости ---
        logger = LoggingService(request=request)
        logger.error_log(log_detail=exc.log_detail)

        # --- Формирование ответа ---
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.response_detail},
            headers=exc.headers,
        )

    @app.exception_handler(AnomalyException)
    async def http_exception_handler(request: Request, exc: AnomalyException) -> JSONResponse:
        """Обработчик ошибок. Рассчитан на обработку и логирование пользовательских исключений класса AnomalyException. Отслеживает аномалии в работе приложения."""

        # --- Внедрение зависимости ---
        logger = LoggingService(request=request)
        logger.anomaly_log(log_detail=exc.log_detail, extra_data=exc.extra_data)

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
        logger = LoggingService(request=request)
        logger.error_log(log_detail=str(exc))

        # --- Формирование ответа ---
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal Server Error"},
        )

