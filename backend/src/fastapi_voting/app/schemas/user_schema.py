from pydantic import BaseModel

from src.fastapi_voting.app.core.enums import RolesEnum


# --- Общая схема пользователя ---
class UserSchema(BaseModel):
    id: int
    first_name: str
    last_name: str
    surname: str
    phone: str
    email: str
    role: RolesEnum

    class Config:
        from_attributes = True

# --- Схемы для регистрации пользователя ---
class InputCreateUserSchema(BaseModel):
    first_name: str
    last_name: str
    surname: str
    phone: str
    email: str
    password: str
    role: RolesEnum


# --- Схемы для авторизации пользователя ---
class InputLoginUserSchema(BaseModel):
    email: str
    password: str
    remember_me: bool

class LoginUserSchema(BaseModel):
    id: int
    first_name: str
    last_name: str
    surname: str
    email: str
    role: RolesEnum

    class Config:
        from_attributes = True

class ResponseLoginUserSchema(BaseModel):
    user: LoginUserSchema
    access_token: str

    class Config:
        from_attributes = True


# --- Схемы для обновления доступов пользователя ---
class OutputRefreshUserSchema(BaseModel):
    access_token: str


# --- Схемы для обновления чувствительных данных пользователя ---
class InputChangeCredentialsSchema(BaseModel):
    first_name: str
    last_name: str
    surname: str | None


# --- Схемы для замены пароля пользователя ---
class InputChangePasswordSchema(BaseModel):
    old_password: str
    new_password: str


# --- Схемы для замены электронной почты пользователя ---
class InputChangeEmailSchema(BaseModel):
    email: str
    password: str


# --- Схемы для ответов АПИ с кд для почты ---
class OutputSentEmailSchema(BaseModel):
    message: str
    rate_minutes: int