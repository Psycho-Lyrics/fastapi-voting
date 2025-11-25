import faker
import random

from sqlalchemy.ext.asyncio import AsyncSession

from src.fastapi_voting.app.models.option import Option
from src.fastapi_voting.app.models.question import Question


# --- Инициализация инструментов ---
faker = faker.Faker()
random = random.Random()


# --- Генератор ---
async def get_fake_options(session: AsyncSession, questions: set[Question])  ->  set[Option]:

    options: set[Option] = set()

    for question in questions:
        option = Option(
            option=faker.text(),
            question_id=question.id,
        )
        options.add(option)

    session.add_all(options)
    await session.flush()

    return options