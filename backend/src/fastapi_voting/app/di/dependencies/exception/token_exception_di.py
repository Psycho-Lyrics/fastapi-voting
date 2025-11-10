
from fastapi import status

from src.fastapi_voting.app.core.enums import TokenTypeEnum

from src.fastapi_voting.app.core.exception import AppException


# --- Фабрика исключений ---
class TokenExceptionDI:

    _handlers = {}

    def __init__(self, token_type: str):
        self._token_type = TokenTypeEnum(token_type)

    def __call__(self):
        handler = self._handlers.get(self._token_type)
        return handler()

    @classmethod
    def register_handler(cls, name: TokenTypeEnum):
        def wrapper(handler):
            cls._handlers[TokenTypeEnum(name)] = handler
            return handler
        return wrapper


    def _invalid(self, log_message: str, status_code: int, www_error: str | None = None):
        return AppException(detail=f"Token Invalid. {log_message}", status_code=status_code, www_error=www_error)

    def _expired(self, log_message: str, status_code: int, www_error: str | None = None):
        return AppException(detail=f"Token Invalid. {log_message}", status_code=status_code, www_error=www_error)

    def _revoked(self, log_message: str):
        return AppException(detail=f"Token Invalid. {log_message}", status_code=status.HTTP_403_FORBIDDEN)


# --- Исключения токенов ---
@TokenExceptionDI.register_handler(TokenTypeEnum.ACCESS_TOKEN)
class AccessTokenExceptionDI(TokenExceptionDI):
    """Зависимость для работы с исключениями для access-токенов"""

    def __init__(self):
        pass

    def invalid(self, log_message: str):
        raise super()._invalid(log_message, status.HTTP_401_UNAUTHORIZED, "access_token_required")

    def expired(self, log_message: str):
        raise super()._expired(log_message=log_message, status_code=status.HTTP_401_UNAUTHORIZED, www_error="access_token_expired")

    def revoked(self, log_message: str):
        raise super()._revoked(log_message=log_message)


@TokenExceptionDI.register_handler(TokenTypeEnum.REFRESH_TOKEN)
class RefreshTokenExceptionDI(TokenExceptionDI):
    """Зависимость для работы с исключениями для refresh-токенов"""

    def __init__(self):
        pass

    def invalid(self, log_message: str):
        raise super()._invalid(log_message=log_message, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

    def expired(self, log_message: str):
        raise super()._expired(log_message=log_message, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

    def revoked(self, log_message: str):
        raise super()._revoked(log_message=log_message)


@TokenExceptionDI.register_handler(TokenTypeEnum.CSRF_TOKEN)
class CSRFTokenExceptionDI(TokenExceptionDI):
    """Зависимость для работы с исключениями для CSRF-токенов"""

    def __init__(self):
        pass

    def invalid(self, log_message: str):
        raise super()._invalid(log_message=log_message, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

    def expired(self, log_message: str):
        raise super()._expired(log_message=log_message, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

    def revoked(self, log_message: str):
        raise super()._revoked(log_message=log_message)
