from typing import Callable

from src.fastapi_voting.app.core.enums import TokenTypeEnum


# --- Фабрика ---
class TokenExceptionFactory:
    """Хранит и возвращает все зарегистрированные хэндлеры."""

    _handlers = {}

    @classmethod
    def register_handler(cls, token_type_handler: TokenTypeEnum):
        """Метод для регистрации поддерживаемых хэндлеров на фабрике."""

        def wrapper(handler: Callable):
            cls._handlers[token_type_handler] = handler
            return handler

        return wrapper

    @classmethod
    def get_handler(cls, token_type: TokenTypeEnum) -> Callable:
        """Возвращает хэндлер требуемого типа."""

        return cls._handlers.get(token_type)

