from fastapi import Depends

from redis.asyncio import Redis

from src.fastapi_voting.app.services.background_task_service import BackgroundTaskService

from src.fastapi_voting.app.di.dependencies.databases_di import get_redis


# --- Определение зависимостей для фоновых задач ---
async def get_background_task_service(redis_client: Redis = Depends(get_redis)):
    return BackgroundTaskService(redis_client)