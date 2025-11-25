from datetime import timedelta

from redis.asyncio import Redis

from fastapi import Request, Depends

from src.fastapi_voting.app.core.exception.simple_exc import TooManyRequests

from src.fastapi_voting.app.core.settings import get_settings


# --- Инструментарий ---
settings = get_settings()

# --- Зависимость для ограничения запросов ---
class ApiLimiterDI: # TODO: Реализована модель фиксированного окна. В будущем рассмотреть реализацию более сложных моделей.

    def __init__(self, times: int, minutes: int):
        self.times = times
        self.minutes = minutes

    async def __call__(self, request: Request):

        # Первичные данные
        redis = request.app.state.redis
        valid_response = self.minutes
        client_ip = request.headers.get("X-Real-IP")
        request_uri = request.url.path

        # Существование и формирование записи
        request_count = await redis.get(f"api-limiter:{request_uri}:{client_ip}")
        if request_count is None:
            await redis.setex(
                name=f"api-limiter:{request_uri}:{client_ip}",
                time=timedelta(minutes=self.minutes).seconds,
                value=1
            )
            return valid_response

        # Проверка на превышение лимита
        request_count = int(request_count.decode("utf-8"))
        if request_count == self.times:
            extra_data = [
                f"Minutes: {self.minutes}",
                f"Times: {self.times}",
                f"Request Count: {request_count}"
            ]
            raise TooManyRequests(log_message="Превышен лимит запросов.", extra_data=extra_data)

        # Инкрементирование значения счётчика
        await redis.incr(
            name=f"api-limiter:{request_uri}:{client_ip}",
            amount=1,
        )

        return valid_response


