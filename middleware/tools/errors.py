"""Lesson m1-3: errors as data.

A tool that raises an exception crashes the loop and the model never sees
why. A tool that returns a structured error gives the model something to act
on: tell the staff member, try another lookup, stop. Every tool in this
track returns ``{"error": {...}}`` instead of raising.

Spec (the checks assert exactly this shape)::

    {"error": {"code": "<one of ERROR_CODES>",
               "message": "<one human sentence>",
               "suggestion": "<what the model could try next>" | null,
               "details": {...}}}

Codes:

    invalid_arguments   the arguments failed validation (details.fields names them)
    not_found           the record does not exist (details carry the lookup key)
    unknown_tool        no tool by that name (details.available lists the names)
    duplicate_call      the same tool with the same arguments already ran this turn
    upstream_error      the business system failed (details.status when HTTP)
    permission_denied   the caller's token lacks the scope (Module 3)
    pending_approval    the write is queued for a human (Module 3)
"""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

ErrorCode = Literal[
    "invalid_arguments",
    "not_found",
    "unknown_tool",
    "duplicate_call",
    "upstream_error",
    "permission_denied",
    "pending_approval",
]

ERROR_CODES: tuple[str, ...] = (
    "invalid_arguments",
    "not_found",
    "unknown_tool",
    "duplicate_call",
    "upstream_error",
    "permission_denied",
    "pending_approval",
)


class ToolErrorData(BaseModel):
    code: ErrorCode
    message: str = Field(min_length=1)
    suggestion: str | None = None
    details: dict[str, Any] = Field(default_factory=dict)


def error_result(code: ErrorCode, message: str, *, suggestion: str | None = None, **details: Any) -> dict[str, Any]:
    """Build the ``{"error": {...}}`` dict a tool returns instead of raising."""
    raise NotImplementedError("Lesson m1-3: implement error_result in tools/errors.py")


def is_error(result: Any) -> bool:
    """True when ``result`` is a tool error dict."""
    raise NotImplementedError("Lesson m1-3: implement is_error in tools/errors.py")
