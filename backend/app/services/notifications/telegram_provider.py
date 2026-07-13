import httpx

from app.services.notifications.base import NotificationError

_API_BASE = "https://api.telegram.org"


class TelegramProvider:
    """Sends via the Telegram Bot API using HTTPX. The bot token is held only in
    memory and never logged or included in error messages."""

    name = "telegram"

    def __init__(self, token: str, timeout_seconds: int) -> None:
        self._token = token
        self._timeout = timeout_seconds

    def send(self, chat_id: str, html_message: str) -> None:
        url = f"{_API_BASE}/bot{self._token}/sendMessage"
        payload = {"chat_id": chat_id, "text": html_message, "parse_mode": "HTML"}
        try:
            response = httpx.post(url, json=payload, timeout=self._timeout)
        except httpx.TimeoutException as exc:
            raise NotificationError("Telegram request timed out.") from exc
        except httpx.HTTPError as exc:
            raise NotificationError("Telegram request failed.") from exc

        if response.status_code != httpx.codes.OK:
            # Do not echo the response body; it may reflect the request/token.
            raise NotificationError(f"Telegram API returned status {response.status_code}.")
