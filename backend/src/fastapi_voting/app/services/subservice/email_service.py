from aiosmtplib import SMTP

from jinja2 import Environment, PackageLoader

from email.utils import formatdate
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from src.fastapi_voting.app.core.settings import get_settings


# --- Инструментарий ---
settings = get_settings()


# --- Сервис ---
class EmailService:

    async def send_change_password_email(self, recipients: list, token: str | None = None):

        # --- Первичные данные ---
        subject = "Подтверждение смены пароля."

        # --- Создание подключения и отправка письма ---
        async with SMTP(
            hostname=settings.SMTP_HOSTNAME,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            use_tls=True

        ) as server:
            message = await self._create_email_message(subject, recipients, token)
            await server.send_message(message)


    @staticmethod
    async def _create_email_message(subject: str, recipients: list, token: str | None):

        # --- Рендеринг шаблона для письма ---
        environment = Environment(
            loader=PackageLoader("fastapi_voting", "templates"),
            autoescape=True,
            enable_async=True,
            variable_start_string="{{", variable_end_string="}}"
        )
        environment.globals["verification_token"] = token
        environment.globals["expire_share"] = settings.EMAIL_SUBMIT_EXPIRE_HOURS

        template = environment.get_template("change_password_email.html")
        message = await template.render_async()

        # --- Создание контейнера и определение заголовков письма ---
        msg = MIMEMultipart("alternative")
        msg["From"] = settings.SMTP_USER
        msg["To"] = ",".join(recipients)
        msg["Date"] = formatdate(localtime=True)
        msg["Subject"] = subject

        # --- Определение современного тела с HTML-шаблоном ---
        html_part = MIMEText(message, "html", "utf-8")
        msg.attach(html_part)

        # --- Результат ---
        return msg
