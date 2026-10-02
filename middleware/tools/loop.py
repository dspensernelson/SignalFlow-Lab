"""Lesson m1-2: the tool-call loop.

    messages + tools -> model -> tool call? -> run it -> append result -> repeat
                                 \\-> final text -> stop

The provider (``tools/provider.py``) hides every vendor's wire format; this
loop only sees ``ModelReply`` objects and provider-agnostic messages, so
swapping Gemini for Groq is a one-line .env change and this file does not
move.

Spec (the checks assert this):

- ``run_loop(provider, registry, user_message, *, system_prompt=SYSTEM_PROMPT,
  max_turns=6) -> LoopResult``
- turn 1 sends ``[system, user]`` plus ``registry.specs()``;
- a reply with tool calls: for each call, ``registry.call(name, arguments)``,
  append an assistant message carrying the tool_calls and one ``tool``
  message per call with ``content=json.dumps(result)``; record the call in
  ``result.tool_calls``;
- a reply with no tool calls ends the loop with its text as ``final_text``;
- the same tool with the same arguments already executed in this run is
  NOT executed again: the tool message carries a ``duplicate_call`` error
  (lesson m1-3 adds the error helper; until then raise NotImplementedError);
- after ``max_turns`` model replies with no final text, stop with
  ``stop_reason="max_turns"`` and ``final_text=None``; never loop forever;
- never let a tool exception escape: ``registry.call`` already returns
  errors as data, and anything else is wrapped as ``upstream_error``.
"""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field

from tools.provider import Provider
from tools.schemas import ToolRegistry

SYSTEM_PROMPT = (
    "You are the donor-operations assistant for Lakeshore Food Pantry. "
    "Use the tools to look things up before answering. Never invent donor data. "
    "Writes (receipts) only when the staff member explicitly asked for one."
)


class ExecutedCall(BaseModel):
    id: str
    name: str
    arguments: dict[str, Any]
    result: dict[str, Any]


class LoopResult(BaseModel):
    final_text: str | None
    stop_reason: str  # "final" | "max_turns" | "provider_error"
    turns: int
    messages: list[dict[str, Any]]
    tool_calls: list[ExecutedCall] = Field(default_factory=list)


def run_loop(
    provider: Provider,
    registry: ToolRegistry,
    user_message: str,
    *,
    system_prompt: str = SYSTEM_PROMPT,
    max_turns: int = 6,
) -> LoopResult:
    raise NotImplementedError("Lesson m1-2: implement run_loop in tools/loop.py")
