"""Lesson m1-1: three CRM tools as contracts a model can use well.

A tool contract is (1) a name, (2) a description the model reads to decide
WHEN to call it and WHAT to pass, and (3) an input schema the model fills in.
In code, the input schema is a pydantic model; ``model_json_schema()`` emits
the JSON Schema that every provider (and MCP, in Module 2) consumes.

The three tools, and what the check requires of each:

    find_donor              FindDonorInput        query: str (min 2 chars)
    get_donation_history    GetDonationHistoryInput
                                                  donor_id: int, since: date | None
    create_receipt          CreateReceiptInput    donation_id: int, sent_to: str,
                                                  format: Literal["email", "pdf"]

- every model AND every field carries a description (Field(description=...))
  of at least 40 characters for the model-level docstring and 15 for fields;
  write them for the model that reads them, not for a human skimming code
  (what the tool is for, when to use it, what a good argument looks like);
- required fields are required (no defaults) except ``since`` and ``format``
  (default "email");
- ``TOOL_SPECS`` lists the three ``{"name", "description", "input_schema"}``
  dicts in the order above, and ``build_registry(client)`` wires each to a
  handler that returns plain dicts (Module 1.3 turns failures into errors).

Lesson m1-3 implements ``ToolRegistry.call`` (validation and errors as data).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from typing import Any, Callable, Literal

from pydantic import BaseModel, Field

from tools.client import DonorClient


class FindDonorInput(BaseModel):
    """TODO (m1-1): describe this tool for the model: when to use it and what
    a good query is (an exact email, or a name when staff name a person)."""

    query: str = Field(min_length=2)


class GetDonationHistoryInput(BaseModel):
    """TODO (m1-1): describe: returns a donor's gifts newest first; use after
    find_donor has given you a donor id."""

    donor_id: int
    since: date | None = None


class CreateReceiptInput(BaseModel):
    """TODO (m1-1): describe: a WRITE that sends a receipt; only after the
    staff member asked for it and the donation id is confirmed."""

    donation_id: int
    sent_to: str = Field(min_length=3)
    format: Literal["email", "pdf"] = "email"


@dataclass
class Tool:
    name: str
    description: str
    input_model: type[BaseModel]
    handler: Callable[[BaseModel], dict[str, Any]]
    writes: bool = False  # Module 3 gates write tools

    def spec(self) -> dict[str, Any]:
        return {"name": self.name, "description": self.description, "input_schema": self.input_model.model_json_schema()}


@dataclass
class ToolRegistry:
    tools: dict[str, Tool] = field(default_factory=dict)

    def register(self, tool: Tool) -> None:
        self.tools[tool.name] = tool

    def specs(self) -> list[dict[str, Any]]:
        """The provider-agnostic tool list the model reads."""
        return [t.spec() for t in self.tools.values()]

    def call(self, name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        """Validate ``arguments`` against the tool's input model, run the
        handler, and return its dict. Never raises: every failure is an
        ``error_result`` (see tools/errors.py). Implemented in lesson m1-3."""
        raise NotImplementedError("Lesson m1-3: implement ToolRegistry.call")


def build_registry(client: DonorClient) -> ToolRegistry:
    """Register the three tools against a DonorClient.

    Handlers (plain dict results; a Donor becomes ``donor.model_dump()``):

    - find_donor -> {"matches": n, "donors": [{id, name, email, notes}, ...]}
      (notes is the staff note on the record; Module 6 sanitizes it)
    - get_donation_history -> {"donor_id": id, "donations": [donation dicts]}
      filtered to ``received_at >= since`` when ``since`` is given
    - create_receipt -> POST {CRM_URL}/receipts {donation_id, sent_to}
      and return {"receipt_id": id, "status": "sent", "duplicate": bool}
    """
    raise NotImplementedError("Lesson m1-1: implement build_registry in tools/schemas.py")


def tool_specs() -> list[dict[str, Any]]:
    """The three specs without needing a client (schema-only view)."""
    raise NotImplementedError("Lesson m1-1: implement tool_specs in tools/schemas.py")


TOOL_NAMES = ("find_donor", "get_donation_history", "create_receipt")
