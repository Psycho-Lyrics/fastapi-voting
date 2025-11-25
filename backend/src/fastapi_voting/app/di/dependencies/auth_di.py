from redis.asyncio import Redis

from fastapi import Request, Depends

from fastapi_csrf_protect import CsrfProtect
from fastapi_csrf_protect.exceptions import TokenValidationError, MissingTokenError, InvalidHeaderError

from jose import jwt
from jose.exceptions import ExpiredSignatureError, JWTError

from src.fastapi_voting.app.core.settings import get_settings
from src.fastapi_voting.app.core.enums import TokenTypeEnum

from src.fastapi_voting.app.core.factory.token_exception_factory import TokenExceptionFactory


# --- Инструментарий ---
settings = get_settings()

# --- Access/Refresh/Email ---
class AuthTokenRequired:
    """Класс-зависимость. Валидирует конкретный токен и возвращает payload """

    def __init__(self, token_type: TokenTypeEnum):
        self.token_type = token_type


    async def __call__(
            self,
            request: Request,
    ):
        # --- Хэндлер и входные данные ---
        redis_client = request.app.state.redis
        token_exc = TokenExceptionFactory.get_handler(token_type=self.token_type)
        token = self.extract_token(request)

        # --- Проверка на наличие токена во входных данных ---
        if token is None:
            raise token_exc.invalid(log_message=f"Во входящем запросе отсутствует {self.token_type.value}.")

        # --- Валидация токена и извлечение payload-данных ---
        try:
            payload = jwt.decode(
                token,
                key=settings.JWT_SECRET_KEY,
                algorithms=["HS256"]
            )
            if self.token_type.value != payload["token_type"]:
                raise token_exc.invalid(log_message=f"Некорректный тип токена: <{payload['token_type']}>. Ожидался <{self.token_type.value}>.")
            # TODO: Привязка по fingerprint

        except ExpiredSignatureError:
            raise token_exc.expired(log_message=f"Был передан просроченный {self.token_type.value}.")

        except JWTError:
            raise token_exc.invalid(log_message=f"Семантика {self.token_type.value} была нарушена.")

        # --- Проверка отозванных токенов ---
        token_is_revoked = await redis_client.exists(f"jwt-block:{payload['jti']}")
        if token_is_revoked:
            raise token_exc.revoked(log_message=f"Был передан отозванный {self.token_type.value}.")

        # --- Ответ ---
        return payload


    def extract_token(self, request: Request):
        """Извлекает и возвращает валидную строку токена"""

        # --- Access ---
        if self.token_type == TokenTypeEnum.ACCESS_TOKEN:
            token_string = request.headers.get("Authorization")

            if token_string and token_string.startswith("Bearer"):
                return token_string[7:]

        # --- Refresh ---
        elif self.token_type == TokenTypeEnum.REFRESH_TOKEN:
            token_string = request.cookies.get("refresh-token")
            return token_string

        return None


# --- CSRF ---
async def csrf_valid(
        request: Request,
        csrf_protect: CsrfProtect = Depends(),
):
    # --- Выбор хэндлера для токена ---
    token_exc = TokenExceptionFactory.get_handler(token_type=TokenTypeEnum.CSRF_TOKEN)

    # --- Валидация токена ---
    try:
        await csrf_protect.validate_csrf(
            request=request,
            cookie_key="fastapi-csrf-token",
            secret_key=settings.CSRF_SECRET_KEY,
        )
    except TokenValidationError:
        raise token_exc.invalid(log_message="Сигнатура CSRF-токена была нарушена")

    except MissingTokenError:
        raise token_exc.invalid(log_message=f"В Cookie отсутствует CSRF-токен.")

    except InvalidHeaderError:
        raise token_exc.invalid(log_message=f"В заголовках запроса не был указан CSRF-токен.")

    return True

