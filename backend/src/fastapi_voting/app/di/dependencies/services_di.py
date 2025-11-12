import logging

from redis.asyncio import Redis

from fastapi import Depends

from fastapi_csrf_protect import CsrfProtect

from src.fastapi_voting.app.services.background_task_service import BackgroundTaskService
from src.fastapi_voting.app.services.token_service import TokenService

from src.fastapi_voting.app.services.voting_service import VotingService
from src.fastapi_voting.app.services.user_service import UserService
from src.fastapi_voting.app.services.department_service import DepartmentService
from src.fastapi_voting.app.services.email_service import EmailService

from src.fastapi_voting.app.repositories.user_repo import UserRepo
from src.fastapi_voting.app.repositories.department_repo import DepartmentRepo
from src.fastapi_voting.app.repositories.voting_repo import VotingRepo

from src.fastapi_voting.app.di.dependencies.repositories_di import (
    get_user_repo,
    get_department_repo,
    get_voting_repo,
)
from src.fastapi_voting.app.di.dependencies.databases_di import (
    get_redis
)
from src.fastapi_voting.app.di.dependencies.email_di import get_email_service
from src.fastapi_voting.app.di.dependencies.background_task_di import get_background_task_service



# --- Инициализация первичных данных ---
logger = logging.Logger("fastapi-voting")


# --- Определение зависимостей бизнес-логики ---
async def get_user_service(
        repo: UserRepo = Depends(get_user_repo),
        email_service: EmailService = Depends(get_email_service),
        task_service: BackgroundTaskService = Depends(get_background_task_service),
):
    return UserService(repo, email_service, task_service)


async def get_department_service(repo: DepartmentRepo = Depends(get_department_repo)):
    return DepartmentService(repo)

async def get_voting_service(repo: VotingRepo = Depends(get_voting_repo)):
    return VotingService(repo)


# --- Определение зависимостей для токенов ---
async def get_token_service(
        redis_client: Redis = Depends(get_redis),
        csrf_protect: CsrfProtect = Depends(),
):
    return TokenService(redis_client, csrf_protect)


