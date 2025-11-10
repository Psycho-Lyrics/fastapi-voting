from enum import Enum


# --- Роли пользователей ---
class RolesEnum(Enum):
    CHIEF = "CHIEF"
    EMPLOYEE = "EMPLOYEE"


# --- Типы вопросов ---
class QuestionTypeEnum(Enum):
    SINGLE = "single_choice"
    MULTIPLE = "multiple_choice"


# --- Типы токенов ---
class TokenTypeEnum(Enum):
    ACCESS_TOKEN = "access_token"
    REFRESH_TOKEN = "refresh_token"
    CSRF_TOKEN = "csrf_token"