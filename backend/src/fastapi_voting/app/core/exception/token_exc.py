from fastapi import status

from src.fastapi_voting.app.core.enums import TokenTypeEnum

from src.fastapi_voting.app.core.exception.base_exc import AppException

from src.fastapi_voting.app.core.factory.token_exception_factory import TokenExceptionFactory
from src.fastapi_voting.app.core.interface.token_exception_interface import TokenExceptionInterface


# --- ACCESS ---
@TokenExceptionFactory.register_handler(TokenTypeEnum.ACCESS_TOKEN)
class AccessTokenException(TokenExceptionInterface):
    """Обработчик для исключений access-токенов."""

    def invalid(self, log_message: str):
        return AppException(log_detail=log_message, detail=f"Invalid Token.", status_code=status.HTTP_401_UNAUTHORIZED, www_error="invalid_token")

    def expired(self, log_message: str):
        return AppException(log_detail=log_message, detail=f"Invalid Token.", status_code=status.HTTP_401_UNAUTHORIZED, www_error="expired_token")

    def revoked(self, log_message: str):
        return AppException(log_detail=log_message, detail=f"Invalid Token.", status_code=status.HTTP_401_UNAUTHORIZED, www_error="revoked_token")


# --- REFRESH ---
@TokenExceptionFactory.register_handler(TokenTypeEnum.REFRESH_TOKEN)
class RefreshTokenException(TokenExceptionInterface):
    """Обработчик для исключений refresh-токенов."""

    def invalid(self, log_message: str):
        return AppException(log_detail=log_message, detail=f"Invalid Token.", status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

    def expired(self, log_message: str):
        return AppException(log_detail=log_message, detail=f"Invalid Token.", status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

    def revoked(self, log_message: str):
        return AppException(log_detail=log_message, detail=f"Invalid Token.", status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)
