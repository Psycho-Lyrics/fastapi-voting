from uuid import UUID

from datetime import timedelta

from src.fastapi_voting.app.core.settings import get_settings

from src.fastapi_voting.app.core.exception.simple_exc import TaskNotFound, TaskAlreadyExist # TODO: Реализовать проверку на наличие таска замены пароля

from redis.asyncio import Redis


# --- Инструментарий ---
settings = get_settings()


# --- Сервис ---
class TaskService:
    """Выполнять роль менеджера для фоновых задач"""

    def __init__(self, redis: Redis):
        self.redis = redis

    async def add_change_password_task(self, uuid_task: UUID, new_password: str):
        """Создаёт отложенный запроса на смену пароля"""

        # Запись в Redis
        await self.redis.setex(
            name=f"pending-password:{uuid_task}",
            time=timedelta(hours=settings.EMAIL_SUBMIT_EXPIRE_HOURS),
            value=new_password
        )


    async def execute_change_password_task(self, uuid_task: UUID):
        """Извлекает данные отложенного запроса на смену пароля и удаляет запись"""

        # Чтение пароля и удаление записи
        password = await self.redis.getdel(
            name=f"pending-password:{uuid_task}",
        )

        # Проверка наличия записи
        if password is None:
            raise TaskNotFound(log_message=f"Задачи на замену пароля с UUID: {uuid_task} не существует.")

        # Ответ
        return password.decode("utf-8")
