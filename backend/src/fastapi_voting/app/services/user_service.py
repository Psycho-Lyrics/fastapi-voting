from uuid import uuid4, UUID

from src.fastapi_voting.app.core.exception.simple_exc import UserNotFound, UserAlreadyExist, InvalidLogin

from src.fastapi_voting.app.repositories.user_repo import UserRepo

from src.fastapi_voting.app.schemas.user_schema import (
    InputCreateUserSchema, InputLoginUserSchema,
)

from src.fastapi_voting.app.models.user import User

from src.fastapi_voting.app.core.enums import RolesEnum

from src.fastapi_voting.app.services.subservice.task_service import TaskService
from src.fastapi_voting.app.services.subservice.email_service import EmailService
from src.fastapi_voting.app.services.subservice.token_service import TokenService


class UserService:
    def __init__(
            self,
            user_repo: UserRepo,

            email_service: EmailService,
            task_service: TaskService,
            token_service: TokenService
    ):
        self.user_repo = user_repo

        self.email_service = email_service
        self.task_service = task_service
        self.token_service = token_service


    async def init_register(self, data: InputCreateUserSchema):
        """Отвечает за инициализацию процедуры регистрации нового пользователя. Создаёт отложенную задачу и отправляет письмо для подтверждения переданного email."""

        # Инициализация и извлечение первичных данных
        user_data: dict = data.model_dump()
        user_data['role'] = RolesEnum(user_data['role']).value

        # Проверка на уникальность пользователя
        user_by_phone: User = await self.user_repo.get_by_item(column=self.user_repo.model.phone, item=user_data["phone"])
        user_by_email: User = await self.user_repo.get_by_item(column=self.user_repo.model.email, item=user_data["email"])

        if user_by_phone:
            raise UserAlreadyExist(f"Пользователь с номером телефона <{user_data['phone']}> уже существует")

        if user_by_email:
            raise UserAlreadyExist(f"Пользователь с таким адресом электронной почты <{user_data['email']}> уже существует")

        # Отправка письма для подтверждения электронной почты
        uuid = uuid4()
        print(uuid)
        await self.email_service.send_confirm_email(recipients=[user_data["email"]], uuid_message=uuid)

        # Формирование отложенной задачи на регистрацию
        await self.task_service.add_confirm_email_task(uuid_task=uuid, data=user_data)


    async def confirm_register(self, uuid: UUID):

        # Выполнение операции регистрации пользователя
        user_data = await self.task_service.execute_confirm_email_task(uuid_task=uuid)

        # Работа репозитория и результат
        user = await self.user_repo.add_user(data=user_data)
        return user


    async def login(self, data: InputLoginUserSchema) -> User:
        """Отвечает за авторизацию пользователя"""

        # --- Инициализация и извлечение первичных данных ---
        data: dict = data.model_dump()

        # --- Проверки на существование пользователя и корректность пароля ---
        user_by_email: User = await self.user_repo.get_by_item(column=self.user_repo.model.email, item=data["email"])
        if not user_by_email:
            raise UserNotFound(log_message=f"Пользователя с почтой <{data['email']}> не существует")

        current_password_is_valid: bool = user_by_email.verify_password(password=data["password"])
        if not current_password_is_valid:
            raise InvalidLogin(log_message=f"Введён неверный пароль для пользователя с ID {user_by_email.id}")

        # --- Формирование ответа ---
        return user_by_email


    async def change_credentials(self, data: dict, user_id: int) -> User:
        """Отвечает за смену учётных данных пользователя, исключая пароль."""

        # --- Проверка на существование пользователя ---
        user_exist: bool = await self.user_repo.exist_by_id(id=user_id)
        if not user_exist:
            raise UserNotFound(log_message=f"Пользователь с ID: {user_id} не найден.")

        # --- Работа репозитория ---
        user = await self.user_repo.change_credentials(data=data, id=user_id)

        # --- Результат ---
        return user


    async def init_change_password(self, data: dict, user_id: int):
        """Отвечает за смену пароля пользователя."""

        # --- Проверка на существование пользователя ---
        user: User = await self.user_repo.get_by_id(id=user_id)
        if not user:
            raise UserNotFound(log_message=f"Пользователь с ID: {user_id} не найден.")

        # --- Верификация пароля ---
        pass_is_valid: bool = user.verify_password(password=data["old_password"])
        if not pass_is_valid:
            raise InvalidLogin(log_message=f"Указан неверный пароль для пользователя с ID <{user_id}>.")

        # --- Отправка письма для подтверждения операции ---
        task_uuid = uuid4()
        await self.email_service.send_change_password_email(recipients=[user.email], uuid_message=task_uuid)

        # --- Формирование отложенной операции ---
        await self.task_service.add_change_password_task(task_uuid, data["new_password"])


    async def confirm_change_password(self, user_id: int, uuid: UUID):
        """Выполняет операцию смены пароля."""

        # --- Выполнение операции смены пароля ---
        password: str = await self.task_service.execute_change_password_task(uuid_task=uuid)
        await self.user_repo.change_password(id=user_id, password=password)
