from redis.asyncio import Redis

from fastapi import Request, Depends

from fastapi_csrf_protect import CsrfProtect
from fastapi_csrf_protect.exceptions import TokenValidationError

from jose import jwt
from jose.exceptions import ExpiredSignatureError, JWTError

from src.fastapi_voting.app.core.settings import get_settings
from src.fastapi_voting.app.core.enums import TokenTypeEnum

# from src.fastapi_voting.app.di.annotations import RedisClientAnnotation TODO: Цикличные импорты. Пересмотреть в пользу использования аннотации
from src.fastapi_voting.app.di.dependencies.databases_di import get_redis

from src.fastapi_voting.app.di.dependencies.exception.token_exception_di import TokenExceptionDI


# --- Инструментарий ---
settings = get_settings()

# --- Зависимости ---
class AuthTokenRequired:
    """Класс-зависимость. Валидирует конкретный токен и возвращает payload """

    def __init__(self, token_type):
        TokenTypeEnum(token_type)
        self.token_type = token_type

    def extract_token(self, request: Request):
        """Извлекает и возвращает валидную строку токена"""

        if self.token_type == "access_token":
            token_string = request.headers.get("Authorization")

            if token_string and token_string.startswith("Bearer"):
                return token_string[7:]

            return None

        elif self.token_type == "refresh_token":
            token_string = request.cookies.get("refresh-token")
            return token_string

        return None


    async def __call__(
            self,
            request: Request,
            redis_client: Redis = Depends(get_redis),
    ):
        # --- Внедрение зависимости ---
        token_exc = TokenExceptionDI(self.token_type)()

        # --- Работа со входными данными ---
        token = self.extract_token(request)

        # --- Проверка на наличие токена во входных данных ---
        if token is None:
            raise token_exc.invalid(log_message=f"В заголовках запроса отсутствует {self.token_type}.")

        # --- Валидация токена и извлечение payload-данных ---
        try:
            payload = jwt.decode(
                token,
                key=settings.JWT_SECRET_KEY,
                algorithms=["HS256"]
            )
        except ExpiredSignatureError:
            raise token_exc.expired(log_message=f"В заголовках запроса указан просроченный {self.token_type}.")

        except JWTError:
            raise token_exc.invalid(log_message=f"Семантика {self.token_type} была нарушена.")

        # --- Проверка отозванных токенов ---
        token_is_revoked = await redis_client.exists(f"jwt-block:{payload['jti']}")

        if token_is_revoked:
            raise token_exc.revoked(log_message=f"В заголовках запроса указан отозванный {self.token_type}.")

        # --- Ответ ---
        return payload


async def csrf_valid(
        request: Request,
        csrf_protect: CsrfProtect = Depends(),
        token_exc: TokenExceptionDI = Depends(TokenExceptionDI("csrf_token")),
):
    try:
        await csrf_protect.validate_csrf(
            request=request,
            cookie_key="fastapi-csrf-token",
            secret_key=settings.CSRF_SECRET_KEY,
        )
    except TokenValidationError:
        raise token_exc.invalid(log_message="Сигнатура CSRF-токена была нарушена")

    return True