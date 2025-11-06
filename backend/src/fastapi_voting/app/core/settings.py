from functools import lru_cache

from pydantic import BaseModel
from pydantic_settings import BaseSettings

from fastapi_csrf_protect import CsrfProtect

from src.fastapi_voting.app.core.utils.paths import get_root_path


# --- Определение класса-конфигурации приложения ---
class CsrfSettings(BaseModel):
    secret_key: str
    cookie_samesite: str
    max_age: int
    cookie_secure: bool

class Settings(BaseSettings):

    # --- Конфигурация приложения ---
    APP_HOST: str
    APP_PORT: int

    # --- Конфигурация пагинации ---
    PER_PAGE: int

    # --- ACCESS и REFRESH ---
    JWT_SECRET_KEY: str
    JWT_ACCESS_EXPIRE_MINUTES: int
    JWT_REFRESH_EXPIRE_DAYS: int

    # --- CSRF ---
    CSRF_SECRET_KEY: str
    CSRF_COOKIE_SAMESITE : str
    CSRF_MAX_AGE: int
    CSRF_COOKIE_SECURE: bool

    # --- TLS ---
    TLS_PRIVATE_KEY: str
    TLS_CERTIFICATE: str

    # --- MySQL ---
    DB_HOST: str
    DB_PORT: str

    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str

    # --- REDIS ---
    RDS_HOST: str
    RDS_PORT: str
    RDS_PASSWORD: str
    RDS_DB: int


    class Config:
        env_file = get_root_path() / ".env"
        extra = "allow"

    def get_db_url(self) -> str:
        return f"mysql+asyncmy://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    def get_redis_url(self) -> str:
        return f"redis://{self.RDS_HOST}:{self.RDS_PORT}"


# --- Определение точек входа для классов-конфигурации ---
@lru_cache()
def get_settings():
    return Settings()

@CsrfProtect.load_config
def get_csrf_settings():
    s = get_settings()

    return CsrfSettings(
        secret_key=s.CSRF_SECRET_KEY,
        cookie_samesite=s.CSRF_COOKIE_SAMESITE,
        max_age=s.CSRF_MAX_AGE,
        cookie_secure=s.CSRF_COOKIE_SECURE,
    )
