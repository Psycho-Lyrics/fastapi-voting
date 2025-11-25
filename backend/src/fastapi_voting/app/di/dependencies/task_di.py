from fastapi import Depends, Request

from redis.asyncio import Redis

from src.fastapi_voting.app.services.subservice.task_service import TaskService


# --- Определение зависимостей для фоновых задач ---
async def get_task_service(request: Request) -> TaskService:
    return TaskService(redis=request.app.state.redis)