import logging
import sys

from fastapi import Request


# --- Инструментарий ---
logger = logging.getLogger("fastapi-voting")


# --- Сервис ---
class LoggingExceptionDI:
    """Сервис для логирования в зависимости от контекста"""

    # --- Свойства класса ---
    available_context = ("HTTP", None)

    # --- Методы класса ---
    def __init__(self, context: str | None = None):
        if context not in self.available_context:
            raise ValueError("Context is not available")

        self.context = context

    def __call__(self, request: Request | None = None):
        self.request = request
        return self


    def info(self, detail: str):
        log_msg = self.get_log_string(detail)
        logger.info(log_msg)

    def warning(self, detail: str):
        log_msg = self.get_log_string(detail)
        logger.warning(log_msg)

    def critical(self, detail: str):
        log_msg = self.get_log_string(detail)
        logger.critical(log_msg)

    def error(self, detail: str):
        log_msg = self.get_log_string(detail)
        logger.error(log_msg)


    def get_log_string(self, detail: str):

        # --- Вспомогательные данные ---
        result = []

        # --- Данные для логирования ---
        if self.context == "HTTP":
            result.extend([
                f"{self.request.method} {self.request.url.path}",
                f"Origin: {self.request.headers.get('Origin')}",
                f"User-Agent: {self.request.headers.get('User-Agent')}",
                f"Host: {self.request.headers.get('Host')}",
                f"Referer: {self.request.headers.get('Referer')}",
            ])

        # --- Формирование ответа ---
        result.extend([f"Detail: {detail}"])
        result = "| ".join(result)
        return result