from redis.asyncio import Redis

from fastapi import Depends

from typing import Annotated

from src.fastapi_voting.app.core.settings import get_settings

from src.fastapi_voting.app.core.enums import TokenTypeEnum

from src.fastapi_voting.app.services.subservice.token_service import TokenService
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
from src.fastapi_voting.app.di.dependencies.rate_limit_di import ApiLimiterDI


# --- Инструментарий ---
settings = get_settings()


# --- Аннотации для сервисов---
UserServiceAnnotation = Annotated[UserService, Depends(get_user_service)]
DepartmentServiceAnnotation = Annotated[DepartmentService, Depends(get_department_service)]
VotingServiceAnnotation = Annotated[VotingService, Depends(get_voting_service)]

# --- Аннотации для токенов ---
TokenServiceAnnotation = Annotated[TokenService, Depends(get_token_service)]

AccessRequiredAnnotation = Annotated[AuthTokenRequired, Depends(AuthTokenRequired(TokenTypeEnum.ACCESS_TOKEN))]
RefreshRequiredAnnotation = Annotated[AuthTokenRequired, Depends(AuthTokenRequired(TokenTypeEnum.REFRESH_TOKEN))]

CSRFValidAnnotation = Annotated[csrf_valid, Depends(csrf_valid)]

# --- Аннотации для ApiLimiter ---
EmailRequestLimitAnnotation = Annotated[ApiLimiterDI, Depends(ApiLimiterDI(**{"times": 1, "minutes": settings.EMAIL_REQUEST_LIMIT_MINUTES}))]
