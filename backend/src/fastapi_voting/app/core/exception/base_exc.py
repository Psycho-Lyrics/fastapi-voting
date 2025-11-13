from fastapi.exceptions import HTTPException


# --- Базовый класс исключений ---
class AppException(HTTPException):
    """Базовый класс-исключение с поддержкой WWW-Authenticate"""

    def __init__(self, log_detail: str, detail: str, status_code: int, www_error: str | None = None):

        # --- Свойства класса и вспомогательные данные ---
        headers = None

        self.exception_detail = detail
        self.log_message = log_detail

        # --- Адаптация заголовков ---
        if status_code == 401:
            headers = {"WWW-Authenticate": f"Bearer realm=\"api\", error=\"{www_error}\""}

        # --- Возбуждение HTTPException ---
        super().__init__(detail=detail, status_code=status_code, headers=headers)


    @property
    def log_detail(self):
        return self.log_message

    @property
    def response_detail(self):
        return self.exception_detail