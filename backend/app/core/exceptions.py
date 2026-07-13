class LeadNotFoundError(Exception):
    """Raised when a lead lookup by id finds nothing. Mapped to HTTP 404."""

    def __init__(self, lead_id: str) -> None:
        self.lead_id = lead_id
        super().__init__(f"Lead {lead_id} not found")
