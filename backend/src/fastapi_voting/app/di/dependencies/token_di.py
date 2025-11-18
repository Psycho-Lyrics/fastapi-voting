from fastapi import Depends

from fastapi_csrf_protect import CsrfProtect

from redis.asyncio import Redis

from src.fastapi_voting.app.services.token_service import TokenService

from src.fastapi_voting.app.di.dependencies.databases_di import get_redis


# --- Определение зависимостей для токенов ---
async def get_token_service(
        redis_client: Redis = Depends(get_redis),
        csrf_protect: CsrfProtect = Depends(),
):
    return TokenService(redis_client, csrf_protect)