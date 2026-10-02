"""Mock business systems for the donor-ops scenario.

Three small FastAPI apps stand in for the systems a real nonprofit runs on:

- ``crm``       the donor CRM (SQLite, seeded from seed_data.json)
- ``email``     an email / receipt service that records what it "sent"
- ``payments``  a payment processor whose confirm endpoint is flaky on purpose

They are the targets every build in the track talks to. They are complete
and are not part of what the learner writes; read them as examples of the
HTTP shapes real systems expose.

Run one by hand (from the ``middleware/`` directory)::

    uv run python -m mock_services crm --port 8001
    uv run python -m mock_services email --port 8002
    uv run python -m mock_services payments --port 8003

The acceptance checks start them on free ports automatically (see
``checks/conftest.py``).
"""

from .crm import create_crm_app
from .email import create_email_app
from .payments import create_payments_app

__all__ = ["create_crm_app", "create_email_app", "create_payments_app"]
