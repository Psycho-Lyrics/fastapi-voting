from fastapi import status

from src.fastapi_voting.app.core.exception.base_exc import AppException, AnomalyException

from src.fastapi_voting.app.core.enums import TokenTypeEnum


# --- Фабрика ---
class TokenExceptionFactory:
    """Хранит и возвращает все зарегистрированные хэндлеры."""

    _handlers = {}

    @classmethod
    def register_handler(cls, token_type_handler: TokenTypeEnum):
        """Метод для регистрации поддерживаемых хэндлеров на фабрике."""
        def wrapper(handler):
            cls._handlers[token_type_handler] = handler
            return handler

        return wrapper

    @classmethod
    def get_handler(cls, token_type: TokenTypeEnum):
        """Возвращает хэндлер требуемого типа."""

        handler = cls._handlers.get(token_type)
        if handler is None:
            raise TypeError(f"Хэндлер для {token_type.value} не зарегистрирован.")

        return handler()


# --- Регистрация обработчиков ---

# ACCESS
@TokenExceptionFactory.register_handler(TokenTypeEnum.ACCESS_TOKEN)
class AccessTokenException:
    """Обработчик для исключений access-токенов."""

    def invalid(self, log_message: str):
        return AnomalyException(log_detail=log_message, extra_data=["Extra: None"], detail=f"Invalid Token.", status_code=status.HTTP_401_UNAUTHORIZED, www_error="invalid_token")

    def expired(self, log_message: str):
        return AppException(log_detail=log_message, detail=f"Invalid Token.", status_code=status.HTTP_401_UNAUTHORIZED, www_error="expired_token")

    def revoked(self, log_message: str):
        return AnomalyException(log_detail=log_message, extra_data=["Extra: None"], detail=f"Invalid Token.", status_code=status.HTTP_403_FORBIDDEN, www_error="revoked_token")


# REFRESH
@TokenExceptionFactory.register_handler(TokenTypeEnum.REFRESH_TOKEN)
class RefreshTokenException:
    """Обработчик для исключений refresh-токенов."""

    def invalid(self, log_message: str):
        return AnomalyException(log_detail=log_message, extra_data=["Extra: None"], detail=f"Invalid Token.", status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

    def expired(self, log_message: str):
        return AppException(log_detail=log_message, detail=f"Invalid Token.", status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

    def revoked(self, log_message: str):
        return AnomalyException(log_detail=log_message, extra_data=["Extra: None"], detail=f"Invalid Token.", status_code=status.HTTP_403_FORBIDDEN)


# CSRF
@TokenExceptionFactory.register_handler(TokenTypeEnum.CSRF_TOKEN)
class CSRFTokenException:
    """Обработчик для исключений csrf-токенов."""

    def invalid(self, log_message: str):
        return AnomalyException(log_detail=log_message, extra_data=["Extra: None"], detail=f"Invalid Token.", status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

    def expired(self, log_message: str):
        return AppException(log_detail=log_message, detail=f"Invalid Token.", status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

    def revoked(self, log_message: str):
        return AnomalyException(log_detail=log_message, extra_data=["Extra: None"], detail=f"Invalid Token.", status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)
