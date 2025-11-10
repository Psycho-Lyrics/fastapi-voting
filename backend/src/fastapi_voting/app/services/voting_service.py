import logging
import math

from src.fastapi_voting.app.core.settings import get_settings

from src.fastapi_voting.app.repositories.voting_repo import VotingRepo

from src.fastapi_voting.app.models import Voting

from src.fastapi_voting.app.schemas.voting_schema import ResponseAllVotingsSchema

from src.fastapi_voting.app.core.exception import VotingNotFound


# --- Инструментарий ---
logger = logging.getLogger("fastapi-voting")
settings = get_settings()

# --- Сервис ---
class VotingService:

    def __init__(self, voting_repo: VotingRepo):
        self.voting_repo = voting_repo


    async def create_voting(self, voting_data: dict) -> Voting:
        # --- Работа репозитория ----
        voting = await self.voting_repo.add_instance(voting_data)

        # --- Ответ сервиса ---
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

        # --- Работа репозитория ---
        votings, total_count = await self.voting_repo.available_votings(user_id, find, page, archived)

        # --- Формирование ответа сервиса ---
        has_prev: bool = True if page > 1 else False
        has_next: bool = True if len(votings) > settings.PER_PAGE else False

        return ResponseAllVotingsSchema(
            items=votings[:settings.PER_PAGE],
            pagination={
                "has_prev": has_prev,
                "has_next": has_next,
                "total_count": math.ceil(total_count / settings.PER_PAGE),
            }
        )