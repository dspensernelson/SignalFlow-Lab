"""Lesson m0-2: a typed client for the donor CRM.

This is the code form of a custom connector: one class, one method per
action, typed inputs and outputs, and a clear error when the record is not
there.

The CRM's HTTP shapes are documented in ``mock_services/crm.py``.
"""

from __future__ import annotations

from pydantic import BaseModel


class Donor(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    phone: str | None = None
    created_at: str
    notes: str = ""

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"


class Donation(BaseModel):
    id: int
    donor_id: int
    amount_cents: int
    currency: str
    received_at: str
    method: str
    processor_ref: str


class CrmError(Exception):
    """Base class for anything the CRM client raises on purpose."""


class DonorNotFound(CrmError):
    """Raised when a donor id does not exist. Carries ``donor_id``."""

    def __init__(self, donor_id: int):
        self.donor_id = donor_id
        super().__init__(f"No donor with id {donor_id}")


class DonorClient:
    """Wraps the CRM REST API.

    Spec (the check calls exactly these):

    - ``DonorClient(base_url: str, timeout: float = 5.0)``
    - ``find_donors(q: str) -> list[Donor]``      GET /donors?q=
    - ``get_donor(donor_id: int) -> Donor``        GET /donors/{id}; 404 -> DonorNotFound
    - ``get_donations(donor_id: int) -> list[Donation]``
                                                   GET /donors/{id}/donations; 404 -> DonorNotFound
    - any other non-2xx -> ``CrmError`` with the status code in the message

    Use ``httpx.Client`` and let pydantic validate every payload.
    """

    def __init__(self, base_url: str, timeout: float = 5.0):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    def find_donors(self, q: str) -> list[Donor]:
        raise NotImplementedError("Lesson m0-2: implement DonorClient.find_donors")

    def get_donor(self, donor_id: int) -> Donor:
        raise NotImplementedError("Lesson m0-2: implement DonorClient.get_donor")

    def get_donations(self, donor_id: int) -> list[Donation]:
        raise NotImplementedError("Lesson m0-2: implement DonorClient.get_donations")
