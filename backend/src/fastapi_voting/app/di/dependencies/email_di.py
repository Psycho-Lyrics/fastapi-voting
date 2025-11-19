from src.fastapi_voting.app.services.subservice.email_service import EmailService


# --- Определение зависимостей для SMTP ---
async def get_email_service():
    return EmailService()