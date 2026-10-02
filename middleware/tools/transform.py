"""Lesson m0-3: map a payment webhook event into a CRM donation record.

This is the code form of the mapping step in a Make or n8n scenario, plus
the first contact with secrets: configuration comes from the environment
(a git-ignored ``.env`` loaded with python-dotenv), and nothing secret is
ever logged.

Golden case: ``checks/m0/golden/`` holds the processor's sample events and
the exact records they must map to.
"""

from __future__ import annotations

import logging

from pydantic import BaseModel

log = logging.getLogger("middleware.transform")


class Config(BaseModel):
    """Runtime configuration read from the environment.

    - ``crm_url``       from CRM_URL (default http://127.0.0.1:8001)
    - ``crm_api_key``   from CRM_API_KEY (required; this is a secret)
    """

    crm_url: str
    crm_api_key: str


class DonationRecord(BaseModel):
    """What the CRM wants. Field rules the check enforces:

    - ``donor_email``    lowercased, stripped
    - ``donor_name``     as given
    - ``amount_cents``   int
    - ``currency``       upper-case ISO code
    - ``method``         one of card | ach | check, from
                         payment_method_details.type ("ach_debit" -> "ach",
                         "card" -> "card", "check" -> "check")
    - ``received_at``    ISO 8601 UTC from the event's ``created`` unix time,
                         e.g. 2026-01-25T12:00:00Z
    - ``processor_ref``  the charge id
    - ``campaign``       metadata.campaign or None
    """

    donor_email: str
    donor_name: str
    amount_cents: int
    currency: str
    method: str
    received_at: str
    processor_ref: str
    campaign: str | None = None


class UnsupportedEvent(ValueError):
    """Raised for any event type other than charge.succeeded."""


def load_config() -> Config:
    """Load ``.env`` (if present) and build a Config from the environment.

    Must raise a clear ``ValueError`` naming the variable when CRM_API_KEY
    is missing. Must never log the key's value.
    """
    raise NotImplementedError("Lesson m0-3: implement load_config")


def webhook_to_donation(event: dict) -> DonationRecord:
    """Map one ``charge.succeeded`` webhook event to a DonationRecord.

    Log one INFO line per event ("transformed <event id> -> <processor_ref>")
    and never include any configuration value in that line.
    """
    raise NotImplementedError("Lesson m0-3: implement webhook_to_donation")
