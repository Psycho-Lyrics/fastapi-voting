# Асинхронный сервис для проведения голосований
## Файловая архитектура проекта - слоистая
```powershell
fastapi-voting                          # Корневой каталог Poetry
├── src
│   └── fastapi_voting                 
│       ├── app                        # Основной модуль приложения
│       │   ├── api                    # Роутеры и контроллеры
│       │   │   └── __init__.py
│       │   ├── core                   # Конфигурация, утилиты, логеры
│       │   │   └── __init.py__        
│       │   ├── db                     # Подключение к БД, миграции
│       │   │   └── __init__.py
│       │   ├── di                     # Dependency Injection
│       │   │   └── __init.py__
│       │   ├── integrations           # Внешние сервисы (SSO, API)
│       │   │   └── __init.py__
│       │   ├── models                 # SQLAlchemy-модели
│       │   │   └── __init.py__
│       │   ├── repositories           # Работа с БД (DAO)
│       │   │   └── __init.py__
│       │   ├── schemas                # Pydantic-схемы (DTO)
│       │   │   └── __init.py__
│       │   ├── services               # Бизнес-логика
│       │   │   └── __init.py__
│       │   └── main.py                # Точка входа FastAPI
│       ├── __init__.py                # Корневой init
│       └── run.py                     # Запуск приложения вручную
├── tests/                             # Тесты
├── .gitignore                         # Git-игнор
├── poetry.lock                        # Файл с фиксированный версиями зависимостей (генерирует Poetry)
├── pyproject.toml                     # Poetry-манифест
└── README.md                          # Документация
```

## Предварительный перечень технологий:
- Python 3.11.9
- Poetry
- FastApi
- SQLAlchemy
- MySQL + asyncmy
- Redis
- Alembic
- Uvicorn (ASGI)
- reverse-proxy Nginx 1.28.0

## Установка зависимостей
Разместить конфигурационный файл с переменными среды (.env) в ``fastapi-voting/`` - в корневом каталоге
Содержимое .env:
```powershell
# Конфигурация приложения
APP_PORT=5000

# --- EMAIL ---
EMAIL_SUBMIT_EXPIRE_HOURS=2

# SMTP
SMTP_HOSTNAME=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=<Почта адресанта электронных писем>
SMTP_PASSWORD=<Пароль приложения Google>

# Конфигурация пагинации
PER_PAGE=5

# ACCESS и REFRESH токены
JWT_SECRET_KEY=c05da040fc7bd6f8f8964405f94d6f4b
JWT_ACCESS_EXPIRE_MINUTES=30
JWT_REFRESH_EXPIRE_DAYS=1

# CSRF-токены
CSRF_SECRET_KEY=8BMagWCAM5jHrz09DMUaZiDe8L1Vj8scPbR3AlUEG8fY6vz8To5A0aT9K0zSSuCU
CSRF_COOKIE_SAMESITE=none
CSRF_MAX_AGE=86400
CSRF_COOKIE_SECURE=true

# MySQL
DB_HOST=127.0.0.1
DB_PORT=3306

DB_USER=root
DB_PASSWORD=0000
DB_NAME=voting

# Redis
RDS_HOST=127.0.0.1
RDS_PORT=6379
RDS_DB=0
RDS_PASSWORD=0000
```

Для создания файла виртуального окружения непосредственно в корневом каталоге проекта(опционально):
```commandline
poetry config virtualenvs.in-project true
```
Для установки всех необходимых зависимостей:
```commandline
poetry install
```

## Установка прокси-сервера для приложения
Предварительно установив архив с Nginx (https://nginx.org/download/nginx-1.28.0.zip), следуйте к каталогу `src/nginx/`.

В корне каталога `src/nginx/` создайте два подкаталога: `core/` и `SSL/fastapi-voting/`.
Разместите в подкаталоге `core/` содержимое установленного ранее архива с Nginx

В корне каталога `src/nginx/` располагается файл с именем `nginx.conf`. 
Переместите этот файл в каталог `src/nginx/core/conf/` с заменой.


### Генерация сертификата.
Для корректной работы шифрования трафика по протоколу TLS требуется иметь SSL-сертификат и приватный ключ. \
Для генерации самоподписанного SSL-сертификата и приватного ключа - перейдите в `src/nginx/SSL/fastapi-voting/`
, и выполните инструкцию:
```commandline
openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:2048 -keyout privateKey.key -out certificate.crt
```

### Запуск прокси-сервера
Для запуска Nginx-сервера перейдите в каталог `src/nginx/core/`
и выполните инструкцию `start nginx.exe`. \
Для проверки работы сервера обратитесь по https://localhost/docs/

## Shell-инструкции CLI
Корректное исполнение инструкций оболочкой требует пребывания в корне проекта на момент применения инструкции
```commandline
poetry run db init - сброс таблиц, применение миграций и наполнение тестовым контентом
poetry run app start - запуск приложения.
```
## Опциональные аргументы инструкций
### `poetry run app start`:
| Аргумент   | По умолчанию | Описание                                                                                     |
|:-----------|:-------------|:---------------------------------------------------------------------------------------------|
| `--reload` | `False`      | Включает режим мониторинга изменений с целью обновления процесса.                            |



