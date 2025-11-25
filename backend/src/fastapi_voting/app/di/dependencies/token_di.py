from fastapi import Depends, Request

from fastapi_csrf_protect import CsrfProtect

from redis.asyncio import Redis

from src.fastapi_voting.app.services.subservice.token_service import TokenService


# --- Определение зависимостей для токенов ---
async def get_token_service(
        request: Request,
        csrf_protect: CsrfProtect = Depends(),
):
    return TokenService(request.app.state.redis, csrf_protect)