import logging

from src.fastapi_voting.app.core.settings import get_settings

from sqlalchemy import select, String, TEXT, cast, or_

from sqlalchemy.ext.asyncio import AsyncSession


# --- Инструментарий ---
logger = logging.getLogger("fastapi-voting")
settings = get_settings()

# --- Репозиторий ---
class Base:

    def __init__(self, model, session: AsyncSession):
        self.session = session
        self.model = model


    async def add_instance(self, data: dict):
        instance = self.model(**data)
        self.session.add(instance)
        await self.session.commit()

        return instance


    async def get_all(self):
        query = select(self.model)
        result = await self.session.execute(query)
        return result.scalars().all()


    async def get_by_id(self, id: int):
        instance = await self.session.get(self.model, id)
        return instance


    async def delete_by_instance(self, instance):
        await self.session.delete(instance)
        return True


    async def get_by_item(self, column, item: any):
        query = select(self.model).where(column == item)
        result = await self.session.execute(query)
        return result.scalars().first()


    def paginate(self, query, page: int):

        # --- Первичные данные ---
        offset = (page - 1) * settings.PER_PAGE
        limit = settings.PER_PAGE + 1

        # --- Формирование запроса ---
        query = query.order_by(self.model.registration_start.desc()).offset(offset).limit(limit)

        # --- Возврат продекорированного запроса ---
        return query


    def search_all(self, query, find):
        """Выборка значений из всех полей по заданному условию поиска"""

        # --- Вспомогательные значение ---
        search_pattern = f"%{find}%"
        search_condition = list()

        # --- Процесс формирование запроса ---
        for column in self.model.__table__.columns:
            if isinstance(column.type, (TEXT, String)):
                search_condition.append(column.ilike(search_pattern))
            else:
                search_condition.append(cast(column, String).ilike(search_pattern))

        # --- Возврат продекорированного запроса ---
        query = query.filter(or_(*search_condition))
        return query