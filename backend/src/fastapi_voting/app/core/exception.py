import logging

from fastapi import status, Request

from fastapi.exceptions import HTTPException


# --- Базовый класс исключений ---
class AppException(HTTPException):
    """Базовый класс-исключение с поддержкой WWW-Authenticate"""

    def __init__(self, detail: str, status_code: int, www_error: str | None = None):
        headers = None

        if status_code == 401:
            headers = {"WWW-Authenticate": f"Bearer realm=\"api\", error=\"{www_error}\""}

        super().__init__(detail=detail, status_code=status_code, headers=headers)


# --- Исключения для пользователей ---
class UserNotFound(AppException):
    def __init__(self, log_message: str):
        super().__init__(detail=f"Invalid Data. {log_message}", status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

class UserAlreadyExist(AppException):
    def __init__(self, log_message: str):
        super().__init__(detail=f"Invalid Data. {log_message}", status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

class InvalidLogin(AppException):
    def __init__(self, log_message: str):
        super().__init__(detail=f"Invalid Data. {log_message}", status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

# --- Исключения для голосований ---
class VotingNotFound(AppException):
    def __init__(self, log_message: str):
        super().__init__(detail=f"Voting not found. {log_message}", status_code=status.HTTP_404_NOT_FOUND)
