import uuid

from redis.asyncio import Redis

from jose import jwt
from fastapi_csrf_protect import CsrfProtect

from datetime import datetime, timedelta, timezone

from sqlalchemy.sql.functions import now

from src.fastapi_voting.app.core.settings import get_settings

from src.fastapi_voting.app.core.enums import TokenTypeEnum


# --- Инструментарий ---
settings = get_settings()


class TokenService:

    def __init__(self, redis: Redis, csrf_protect: CsrfProtect):
        self.redis = redis
        self.csrf_protect = csrf_protect

    @staticmethod
    def _create_token(user_id: int, token_type: TokenTypeEnum, expire: timedelta, client_ip: str):
        """Отвечает за генерацию токена указанного типа."""

        # --- Формирование полезной нагрузки токена ---
        exp = datetime.now(timezone.utc) + expire
        payload = {
            "sub": str(user_id),
            "ip": client_ip,
            "jti": str(uuid.uuid4()),
            "token_type": token_type.value,
            "exp": int(exp.timestamp()),
            "iat": int(datetime.now(timezone.utc).timestamp()),
        }
        # --- Генерация токена и ответ ---
        token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm="HS256")
        return token


    def create_tokens(self, user_id: int, client_ip: str, refresh: bool = False) -> dict[str, str]:
        """Формирование JWT-токенов"""

        # --- Access-Token ---
        access_token = self._create_token(
            user_id=user_id,
            client_ip=client_ip,
            token_type=TokenTypeEnum.ACCESS_TOKEN,
            expire=timedelta(minutes=settings.JWT_ACCESS_EXPIRE_MINUTES),
        )

        # --- Refresh-Token ---
        if refresh:
            refresh_token = self._create_token(
                user_id=user_id,
                client_ip=client_ip,
                token_type=TokenTypeEnum.REFRESH_TOKEN,
                expire=timedelta(days=settings.JWT_REFRESH_EXPIRE_DAYS),
            )

        # --- Ответ ---
        return {
            "access_token": access_token,
            "refresh_token": refresh_token if refresh else None,
        }


    def create_csrf(self) -> tuple[str, str]:
        """Генерирует и возвращает пару CSRF-токенов"""

        csrf_token, signed_csrf = self.csrf_protect.generate_csrf_tokens()
        return csrf_token, signed_csrf


    def create_email_verification_token(self, user_id: int, client_ip: str) -> str:
        """Генерирует и возвращает токен для верификации почты."""

        # --- Генерация токена ---
        token = self._create_token(
            user_id=user_id,
            client_ip=client_ip,
            token_type=TokenTypeEnum.EMAIL_TOKEN,
            expire=timedelta(days=settings.EMAIL_SUBMIT_EXPIRE_HOURS),
        )

        # --- Ответ ---
        return token


    async def revoke_token(self, token_payload: dict[str, str]) -> None:
        """Досрочно отзывает переданный токен"""

        # --- Первичные данные ---
        actual_expire = datetime.fromtimestamp(float(token_payload["exp"]), timezone.utc)
        ttl: timedelta = actual_expire - datetime.now(timezone.utc)

        # --- Размещение записи о токене ---
        await self.redis.setex(name=f"jwt-block:{token_payload['jti']}", time=ttl, value="1")

