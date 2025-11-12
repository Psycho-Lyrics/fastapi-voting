from aiosmtplib import SMTP

from email.utils import formatdate
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from src.fastapi_voting.app.core.settings import get_settings


# --- Инструментарий ---
settings = get_settings()


# --- Сервис ---
class EmailService:

    async def send(self, subject: str, message: str, recipients: list):

        # --- Создание подключения и отправка письма ---
        async with SMTP(
            hostname=settings.SMTP_HOSTNAME,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            use_tls=True

        ) as server:
            message = self._create_email_message(subject, message, recipients)
            await server.send_message(message)

    @staticmethod
    def _create_email_message(subject: str, message: str, recipients: list):

        # --- Создание контейнера и определение заголовков письма ---
        msg = MIMEMultipart("alternative")
        msg["From"] = settings.SMTP_USER
        msg["To"] = ",".join(recipients)
        msg["Date"] = formatdate(localtime=True)
        msg["Subject"] = subject

        # --- Определение простого текстового тела ---
        text_part = MIMEText(message, "plain", "utf-8")
        msg.attach(text_part)

        # --- Определение современного тела с HTML-шаблоном ---
        html_part = MIMEText(message, "html", "utf-8")
        msg.attach(html_part)

        # --- Результат ---
        return msg
