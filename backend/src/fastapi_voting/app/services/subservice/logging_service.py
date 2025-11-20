import logging

from fastapi import Request

# --- Инструментарий ---
logger = logging.getLogger("fastapi-voting")


# --- Сервис ---
class LoggingService: # TODO: Асинхронное логирование

    def __init__(self, request: Request):
        self.request = request

    def input_log(self):
        log_string = self._create_log_string()
        logger.info(log_string)

    def error_log(self, log_detail: str):
        log_string = self._create_log_string(log_detail=log_detail)
        logger.error(log_string)

    def anomaly_log(self, log_detail: str, extra_data: list[str]):
        log_string = self._create_log_string(log_detail=log_detail, extra_data=extra_data)
        logger.warning(log_string)


    def _create_log_string(self, log_detail: str = None, extra_data: list[str] = None) -> str:

        # Формирование данных для логирования
        result = [
            f"{self.request.method} {self.request.url}",
            f"Client-IP: {self.request.headers.get('X-Real-Ip')}",
            f"Host: {self.request.headers.get('Host')}",
            f"Origin: {self.request.headers.get('Origin')}",
            f"Referer: {self.request.headers.get('Referer')}",
        ]

        # Обогащение данных
        if extra_data:
            result.extend(extra_data)

        if log_detail:
            result.insert(1, f"Detail: {log_detail}")

        # Результат
        result = " | ".join(result)
        return result

