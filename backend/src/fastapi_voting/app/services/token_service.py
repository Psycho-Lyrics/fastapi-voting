import uuid

from redis.asyncio import Redis

from jose import jwt
from fastapi_csrf_protect import CsrfProtect

from datetime import datetime, timedelta, timezone

from src.fastapi_voting.app.core.settings import get_settings


# --- Инструментарий ---
settings = get_settings()


class TokenService:

    def __init__(self, redis: Redis, csrf_protect: CsrfProtect):
        self.redis = redis
        self.csrf_protect = csrf_protect


    def create_tokens(self, user_id: int, refresh: bool = False) -> dict[str, str]:
        """Формирование JWT-токенов"""

        # --- Access-Token ---
        exp = datetime.now() + timedelta(minutes=settings.JWT_ACCESS_EXPIRE_MINUTES)
        now = datetime.now(timezone.utc)
        payload = {
            "sub": str(user_id),
            "token_type": "access",
            "jti": str(uuid.uuid4()),
            "exp": int(exp.timestamp()),
            "iat": int(now.timestamp())
        }
        access_token: str = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm="HS256")
        # TODO: Дублирование кода. Пересмотреть
        # --- Refresh-Token ---
        if refresh:
            exp = datetime.now() + timedelta(days=settings.JWT_REFRESH_EXPIRE_DAYS)
            now = datetime.now(timezone.utc)
            refresh_payload = {
                "sub": str(user_id),
                "token_type": "refresh",
                "jti": str(uuid.uuid4()),
                "exp": int(exp.timestamp()),
                "iat": int(now.timestamp())
            }
            refresh_token: str = jwt.encode(refresh_payload, settings.JWT_SECRET_KEY, algorithm="HS256")

        # --- Ответ ---
        return {
            "access_token": access_token,
            "refresh_token": refresh_token if refresh else None,
        }


    def create_csrf(self) -> tuple[str, str]:
        """Генерирует и возвращает пару CSRF-токенов"""

        csrf_token, signed_csrf = self.csrf_protect.generate_csrf_tokens()
        return csrf_token, signed_csrf


    async def revoke_token(self, token_payload: dict[str, str]) -> None:
        """Досрочно отзывает переданный токен"""

        # --- Первичные данные ---
        actual_expire = datetime.fromtimestamp(float(token_payload["exp"]), timezone.utc)
        ttl: timedelta = actual_expire - datetime.now(timezone.utc)

        # --- Размещение записи о токене ---
        await self.redis.setex(name=f"jwt-block:{token_payload['jti']}", time=ttl, value="1")

