import logging
import math

from src.fastapi_voting.app.core.settings import get_settings

from src.fastapi_voting.app.repositories.voting_repo import VotingRepo

from src.fastapi_voting.app.models import Voting, Question, Option

from src.fastapi_voting.app.schemas.voting_schema import (
    ResponseAllVotingsSchema, OutputAllVotingsSchema,
    InputCreateVotingSchema,
)

from src.fastapi_voting.app.core.exception.simple_exc import VotingNotFound


# --- Инструментарий ---
logger = logging.getLogger("fastapi-voting")
settings = get_settings()

# --- Сервис ---
class VotingService:

    def __init__(self, voting_repo: VotingRepo):
        self.voting_repo = voting_repo


    async def create_voting(self, voting_data: InputCreateVotingSchema, creator_id: int) -> Voting:

        # Работа с первичными данными
        voting_data = voting_data.model_dump()
        voting_data["creator_id"] = creator_id

        # Формирование записи о вопросах голосования
        res_questions = list()

        for question in voting_data["questions"]:
            question["options"] = list(map(lambda option: Option(**option), question["options"]))
            res_questions.append(Question(**question))
        else:
            voting_data["questions"] = res_questions

        # Работа репозитория и ответ
        voting = await self.voting_repo.add_instance(voting_data)
        return voting


    async def delete_voting(self, voting_id: int) -> bool:

        # --- Проверка на существование записи ---
        voting = await self.voting_repo.get_by_id(voting_id)
        if (voting is None) or (voting.deleted):
            raise VotingNotFound(log_message=f"Голосования с ID {voting_id} не существует.")

        # --- Работа репозитория ----
        await self.voting_repo.delete(voting)

        # --- Ответ сервиса ---
        return True


    async def get_all_votings(self, user_id: int, find: str | None, page: int, archived: bool) -> ResponseAllVotingsSchema:

        # Работа репозитория
        items, total_count = await self.voting_repo.available_votings(user_id, find, page, archived)

        # Вспомогательные данные
        has_prev: bool = True if page > 1 else False
        has_next: bool = True if len(items) > settings.PER_PAGE else False

        # Формирование данных ответа
        fields = ["voting", "creator_id", "creator_first_name", "creator_last_name"]
        action = lambda row: OutputAllVotingsSchema.model_validate(dict(zip(fields, row)))
        result = list(map(action, items))

        # Формирование ответа сервиса
        return ResponseAllVotingsSchema(
            items=result,
            pagination={
                "has_prev": has_prev,
                "has_next": has_next,
                "total_count": math.ceil(total_count / settings.PER_PAGE),
            }
        )