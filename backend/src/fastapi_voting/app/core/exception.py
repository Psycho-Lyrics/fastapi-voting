import logging

from fastapi import status, Request

from fastapi.exceptions import HTTPException


# --- Инструментарий ---
logger = logging.getLogger("fastapi-voting")


# --- Базовый класс исключений ---
class AppException(HTTPException):
    """Базовый класс-исключение с поддержкой WWW-Authenticate"""

    def __init__(self, detail: str, status_code: int, www_error: str | None = None):
        headers = None

        if status_code == 401:
            headers = {"WWW-Authenticate": f"Bearer realm=\"api\", error=\"{www_error}\""}

        super().__init__(detail=detail, status_code=status_code, headers=headers)


# --- Базовый класс исключений для токенов ---
class TokenException(AppException):
    def __init__(self, request: Request, detail: str, status_code: int, www_error: str | None = None):

        # Данные для логирования
        url = request.url.path
        request_method = request.method

        user_agent = request.headers.get("User-Agent")
        referer = request.headers.get("Referer")
        origin = request.headers.get("Origin")
        host = request.headers.get("Host")

        get_log_string = lambda msg: f"{request_method} {url} - {msg}. Origin: {origin}, User-Agent: {user_agent}, Host: {host}, Referer: {referer}"

        # Определение сообщения для логов
        match detail:
            case "Invalid token":
                log_msg = get_log_string("Некорректный токен")

            case "Token expired":
                log_msg = get_log_string("Токен просрочен")

            case "Token revoked":
                log_msg = get_log_string("Токен был отозван")

            case "Invalid CSRF-token":
                log_msg = get_log_string("Некорректный CSRF-токен")

        # Логирование исключения
        logger.warning(log_msg)

        # Возбуждение исключения
        super().__init__(detail, status_code, www_error)


# --- Исключения для токенов ---

class TokenInvalid(TokenException):
    def __init__(self, request: Request):
        super().__init__(request, detail="Invalid token", status_code=status.HTTP_401_UNAUTHORIZED, www_error="token_invalid")

class TokenExpired(TokenException):
    def __init__(self, request: Request):
        super().__init__(request, detail="Token expired", status_code=status.HTTP_401_UNAUTHORIZED, www_error="token_expired")

class TokenIsRevoked(TokenException):
    def __init__(self, request: Request):
        super().__init__(request, detail="Token revoked", status_code=status.HTTP_403_FORBIDDEN)

class InvalidCSRF(TokenException):
    def __init__(self, request: Request):
        super().__init__(request, detail="Invalid CSRF-token", status_code=status.HTTP_401_UNAUTHORIZED, www_error="CSRF_invalid")


# --- Исключения для пользователей ---
class UserNotFound(AppException):
    def __init__(self):
        super().__init__(detail="Incorrect data", status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)


class UserAlreadyExist(AppException):
    def __init__(self):
        super().__init__(detail="Incorrect data", status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)


class InvalidLogin(AppException):
    def __init__(self):
        super().__init__(detail="Incorrect data", status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)


# --- Исключения для голосований ---
class VotingNotFound(AppException):
    def __init__(self):
        super().__init__(detail="Voting not found", status_code=status.HTTP_404_NOT_FOUND)
