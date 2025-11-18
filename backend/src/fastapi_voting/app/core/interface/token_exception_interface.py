from abc import ABC, abstractmethod


class TokenExceptionInterface(ABC):
    """Интерфейс для реализации классов обработки исключений, связанных с токенами."""

    @abstractmethod
    async def invalid(self, log_message: str): ...

    @abstractmethod
    async def expired(self, log_message: str): ...

    @abstractmethod
    async def revoked(self, log_message: str): ...