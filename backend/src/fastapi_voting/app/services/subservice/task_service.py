from datetime import timedelta

from src.fastapi_voting.app.core.settings import get_settings

from redis.asyncio import Redis


# --- Инструментарий ---
settings = get_settings()


# --- Сервис ---
class TaskService:
    """Выполнять роль менеджера для фоновых задач"""

    def __init__(self, redis: Redis):
        self.redis = redis

    async def add_change_password_task(self, user_id: int, new_password: str):
        """Создаёт отложенный запроса на смену пароля"""

        # --- Запись в Redis ---
        await self.redis.setex(
            name=f"pending-password:{user_id}",
            time=timedelta(hours=settings.EMAIL_SUBMIT_EXPIRE_HOURS),
            value=new_password
        )


    async def execute_change_password_task(self, user_id: int):
        """Извлекает данные отложенного запроса на смену пароля и удаляет запись"""

        # --- Чтение пароля и удаление записи ---
        password = await self.redis.getex(
            name=f"pending-password:{user_id}",
            px=1
        )
        # --- Ответ ---
        return password.decode("utf-8")
