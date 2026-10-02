"""Lesson m7-2: human in the loop. Interrupt before the write, resume after
approval, expire when nobody answers.

LangGraph's ``interrupt(payload)`` pauses the graph inside a node and
surfaces the payload to whoever runs it; ``Command(resume=value)`` continues
the same node with that value. With a checkpointer, the pause survives a
process restart: the state is on disk, and the resume can come from a
different process hours later.

Spec (the check asserts this):

- ``approval_node(state, tools, clock)`` is the ``approval`` node body used
  by ``build_graph``:
    1. if ``state["requested_at"]`` is None, set it to ``clock()``;
    2. ``decision = interrupt({"draft": state["draft"], "tool_calls":
       state["tool_calls"], "requested_at": ...})``;
    3. when ``decision["approved"]`` is true: call ``tools.call(
       "create_receipt", {"donation_id": decision["donation_id"], "sent_to":
       decision["sent_to"]})``, append the name to ``tool_calls`` and store
       the result as ``approval`` (the server's gate makes it
       ``pending_approval``, which is correct: two people, two gates);
    4. otherwise store ``{"status": "rejected", "reason": decision.get(
       "reason", "declined")}`` and never call a write tool;
    5. set ``route = "done"`` so the supervisor is not consulted again.
- ``pending_interrupt(graph, config) -> dict | None`` returns the interrupt
  payload when the thread is paused at ``approval``, else None.
- ``approve(graph, config, *, donation_id, sent_to, decided_by) -> AgentState``
  resumes with an approved decision.
- ``reject(graph, config, reason="declined") -> AgentState``.
- ``expire_pending(graph, config, *, timeout_seconds, clock) -> AgentState
  | None``: when the paused thread's ``requested_at`` is older than
  ``timeout_seconds`` resume it with ``{"approved": False, "reason":
  "timeout"}`` and return the state; otherwise return None.
"""

from __future__ import annotations

import time
from typing import Any, Callable

from agent.mcp_tools import MCPToolSource


def approval_node(state: dict[str, Any], tools: MCPToolSource, clock: Callable[[], float] = time.time) -> dict[str, Any]:
    raise NotImplementedError("Lesson m7-2: implement approval_node in agent/hitl.py")


def pending_interrupt(graph: Any, config: dict[str, Any]) -> dict[str, Any] | None:
    raise NotImplementedError("Lesson m7-2: implement pending_interrupt in agent/hitl.py")


def approve(graph: Any, config: dict[str, Any], *, donation_id: int, sent_to: str, decided_by: str) -> dict[str, Any]:
    raise NotImplementedError("Lesson m7-2: implement approve in agent/hitl.py")


def reject(graph: Any, config: dict[str, Any], reason: str = "declined") -> dict[str, Any]:
    raise NotImplementedError("Lesson m7-2: implement reject in agent/hitl.py")


def expire_pending(graph: Any, config: dict[str, Any], *, timeout_seconds: float, clock: Callable[[], float] = time.time) -> dict[str, Any] | None:
    raise NotImplementedError("Lesson m7-2: implement expire_pending in agent/hitl.py")
