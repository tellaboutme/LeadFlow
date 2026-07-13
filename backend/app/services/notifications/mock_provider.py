class MockNotificationProvider:
    """No-network provider that records sent messages for inspection/testing."""

    name = "mock"

    def __init__(self) -> None:
        self.sent: list[tuple[str, str]] = []

    def send(self, chat_id: str, html_message: str) -> None:
        self.sent.append((chat_id, html_message))
