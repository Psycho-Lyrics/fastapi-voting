from redis.asyncio import Redis

from fastapi import Depends

from typing import Annotated

from src.fastapi_voting.app.core.enums import TokenTypeEnum

from src.fastapi_voting.app.services.token_service import TokenService
from src.fastapi_voting.app.services.user_service import UserService
from src.fastapi_voting.app.services.department_service import DepartmentService
from src.fastapi_voting.app.services.voting_service import VotingService

from src.fastapi_voting.app.di.dependencies.auth_di import (
    AuthTokenRequired,
    csrf_valid
)
from src.fastapi_voting.app.di.dependencies.services_di import (
    get_user_service,
    get_department_service,
    get_voting_service,
    get_token_service,
)
from src.fastapi_voting.app.di.dependencies.databases_di import (
    get_redis
)


# --- Аннотации для сервисов---
UserServiceAnnotation = Annotated[UserService, Depends(get_user_service)]
DepartmentServiceAnnotation = Annotated[DepartmentService, Depends(get_department_service)]
VotingServiceAnnotation = Annotated[VotingService, Depends(get_voting_service)]

# --- Аннотации для токенов ---
TokenServiceAnnotation = Annotated[TokenService, Depends(get_token_service)]

AccessRequiredAnnotation = Annotated[AuthTokenRequired, Depends(AuthTokenRequired(TokenTypeEnum.ACCESS_TOKEN))]
RefreshRequiredAnnotation = Annotated[AuthTokenRequired, Depends(AuthTokenRequired(TokenTypeEnum.REFRESH_TOKEN))]
EmailTokenRequiredAnnotation = Annotated[AuthTokenRequired, Depends(AuthTokenRequired(TokenTypeEnum.EMAIL_TOKEN))]

CSRFValidAnnotation = Annotated[csrf_valid, Depends(csrf_valid)]

# --- Аннотации для Redis ---
RedisClientAnnotation = Annotated[Redis, Depends(get_redis)]

