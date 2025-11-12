from src.fastapi_voting.app.core.exception import UserNotFound, UserAlreadyExist, InvalidLogin

from src.fastapi_voting.app.repositories.user_repo import UserRepo

from src.fastapi_voting.app.schemas.user_schema import (
    InputCreateUserSchema, InputLoginUserSchema,
)

from src.fastapi_voting.app.models.user import User

from src.fastapi_voting.app.core.enums import RolesEnum

from src.fastapi_voting.app.services.background_task_service import BackgroundTaskService
from src.fastapi_voting.app.services.email_service import EmailService


class UserService:
    def __init__(self, user_repo: UserRepo, email_service: EmailService, background_task_service: BackgroundTaskService):
        self.user_repo = user_repo
        self.email_service = email_service
        self.background_task_service = background_task_service


    async def register(self, data: InputCreateUserSchema) -> User:
        """Отвечает за регистрацию нового пользователя"""

        # --- Инициализация и извлечение первичных данных ---
        user_data: dict = data.model_dump()
        user_data['role'] = RolesEnum(user_data['role'])

        # --- Проверка на уникальность пользователя ---
        user_by_phone: User = await self.user_repo.get_by_item(column=self.user_repo.model.phone, item=user_data["phone"]) # TODO: Оптимизировать
        user_by_email: User = await self.user_repo.get_by_item(column=self.user_repo.model.email, item=user_data["email"])

        if user_by_phone:
            raise UserAlreadyExist(f"Пользователь с номером телефона <{user_data['phone']}> уже существует")

        if user_by_email:
            raise UserAlreadyExist(f"Пользователь с таким адресом электронной почты <{user_data['email']}> уже существует")

        # --- Регистрация пользователя ---
        result: User = await self.user_repo.add_user(user_data)

        # --- Формирование ответа ---
        return result


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


    async def change_password(self, data: dict, user_id: int):
        """Отвечает за смену пароля пользователя."""

        # --- Проверка на существование пользователя ---
        user: User = await self.user_repo.get_by_id(id=user_id)
        if not user:
            raise UserNotFound(log_message=f"Пользователь с ID: {user_id} не найден.")

        # --- Верификация пароля ---
        pass_is_valid: bool = user.verify_password(password=data["old_password"])
        if not pass_is_valid:
            raise InvalidLogin(log_message=f"Указан неверный пароль <{data['password']}> для пользователя с ID <{user_id}>.")

        # --- Отправка письма для подтверждения операции ---
        subject = "Подтверждение смены пароля."
        message = "#" # TODO: Ожидаю вёрстку шаблона письма
        await self.email_service.send(subject, message, recipients=[user.email])

        # --- Формирование отложенной операции ---
        #await self.background_task_service