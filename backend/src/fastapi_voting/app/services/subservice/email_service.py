from uuid import UUID

from aiosmtplib import SMTP

from jinja2 import Environment, PackageLoader

from email.utils import formatdate
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from src.fastapi_voting.app.core.settings import get_settings

from src.fastapi_voting.app.core.enums import TemplateTypeEnum


# --- Инструментарий ---
settings = get_settings()


# --- Сервис ---
class EmailService:
    """Сервис для работы с почтой. Рендеринг писем, создание и управление подключением к SMTP-серверам и отправка писем - юрисдикция этого сервиса."""

    async def send_change_password_email(self, recipients: list, uuid_message: UUID):
        subject = "Подтверждение смены пароля."
        async with self.smtp_context as smtp:
            msg = await self._create_email_message(subject, recipients, TemplateTypeEnum.CHANGE_PASSWORD, uuid_message)
            await smtp.send_message(msg)

    async def send_confirm_email(self, recipients: list, uuid_message: UUID):
        subject = "Подтверждение электронной почты."
        async with self.smtp_context as smtp:
            msg = await self._create_email_message(subject, recipients, TemplateTypeEnum.CONFIRM_EMAIL, uuid_message)
            await smtp.send_message(msg)


    @property
    def smtp_context(self):
        smtp = SMTP(
            hostname=settings.SMTP_HOSTNAME,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            use_tls=True
        )
        return smtp

    @staticmethod
    async def _create_email_message(subject: str, recipients: list, template: TemplateTypeEnum, uuid_message: UUID):

        # Рендеринг шаблона для письма
        environment = Environment(
            loader=PackageLoader("fastapi_voting", "templates"),
            autoescape=True,
            enable_async=True,
            variable_start_string="{{", variable_end_string="}}"
        )
        environment.globals["email_uuid"] = uuid_message
        environment.globals["frontend_ip"] = settings.FRONTEND_IP
        environment.globals["frontend_port"] = settings.FRONTEND_PORT
        environment.globals["expire_share"] = settings.EMAIL_SUBMIT_EXPIRE_HOURS

        template = environment.get_template(template.value)
        message = await template.render_async()

        # Создание контейнера и определение заголовков письма
        msg = MIMEMultipart("alternative")
        msg["From"] = settings.SMTP_USER
        msg["To"] = ",".join(recipients)
        msg["Date"] = formatdate(localtime=True)
        msg["Subject"] = subject

        # Определение современного тела с HTML-шаблоном
        html_part = MIMEText(message, "html", "utf-8")
        msg.attach(html_part)

        # Результат
        return msg


