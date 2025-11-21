from sqlalchemy import select, update


from src.fastapi_voting.app.repositories.base_repo import Base

from src.fastapi_voting.app.models.user import User

from src.fastapi_voting.app.schemas.user_schema import InputCreateUserSchema


class UserRepo(Base):

    def __init__(self, session):
        super().__init__(User, session)

    async def add_user(self, data: dict) -> User:
        password = data.pop("password")
        user = self.model(**data)
        user.set_hash_password(password)

        self.session.add(user)
        await self.session.commit()

        return user


    async def change_credentials(self, data: dict, id: int) -> User:

        # --- Формирование и исполнение запроса ---
        query = update(self.model).where(self.model.id == id).values(**data)
        await self.session.execute(query)
        await self.session.commit()

        # --- Формирование и исполнение запроса на данные обновлённого пользователя ---
        user = await self.session.get(self.model, id)

        # --- Результат ---
        return user


    async def change_email(self, id: int, email: str) -> bool:
        query = update(self.model).where(self.model.id == id).values(email=email)
        await self.session.execute(query)
        await self.session.commit()
        return True


    async def change_password(self, password: str, id: int):
        user = await self.session.get(self.model, id)
        user.set_hash_password(password)

        self.session.add(user)
        await self.session.commit()

        return True