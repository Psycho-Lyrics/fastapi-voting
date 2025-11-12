from datetime import datetime, timezone

from redis.asyncio import Redis


class BackgroundTaskService:
    """Выполнять роль менеджера для фоновых задач"""

    def __init__(self, redis: Redis):
        self.redis = redis

    async def add_change_password_task(self, new_password: str):
        pass