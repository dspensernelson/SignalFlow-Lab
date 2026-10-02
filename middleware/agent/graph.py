"""Lesson m7-1: a LangGraph agent that uses the middleware.

Four nodes, one supervisor that routes between them, and the MCP server
as the only way to touch a business system:

    supervisor --route--> lookup   (read tools through MCP, loop until text)
                   \\----> draft    (ask the model for the thank-you text)
                    \\---> approval (lesson m7-2: interrupt, then the write)
                     \\--> done

What a framework adds beyond the Module 1 loop: explicit state that
persists between nodes, named routes you can see in a trace, interrupts
for a human, and checkpoints so a run resumes after a restart.

The supervisor asks the provider for one word. With the replay provider
the route decisions are scripted (the check does this); with a live
provider the model decides. Keep the routing prompt short and the accepted
words exact.

Spec (the check asserts this):

- ``AgentState`` (TypedDict): ``messages`` (provider-agnostic chat list),
  ``route`` (str), ``tool_calls`` (list[str], every MCP tool executed, in
  order), ``draft`` (str | None), ``approval`` (dict | None), ``requested_at``
  (float | None), ``done`` (bool).
- ``ROUTES = ("lookup", "draft", "approval", "done")``.
- ``build_graph(provider, tools: MCPToolSource, *, checkpointer=None,
  clock=time.time)`` returns a compiled LangGraph. Nodes:
    * ``supervisor``: ``provider.complete(messages + [routing prompt], [])``;
      the reply text, lower-cased and stripped, must be one of ROUTES (an
      unknown answer routes to ``done`` and appends a note); sets ``route``.
    * ``lookup``: a bounded loop (max 4 turns) over ``tools.tools(read
      names)``: tool calls go through ``tools.call``, results are appended
      as tool messages, names are appended to ``tool_calls``; ends on a text
      reply. Never calls a write tool even if the model asks (append an
      error message instead).
    * ``draft``: ``provider.complete(messages + [draft instruction], [])``;
      sets ``draft`` and appends the assistant message.
    * ``approval``: lesson m7-2 (``agent/hitl.py``); until then, sets
      ``done`` without writing.
    * ``done``: sets ``done = True``.
  Conditional edges: supervisor -> route; lookup/draft/approval ->
  supervisor; done -> END.
- ``initial_state(user_message, system_prompt=SYSTEM_PROMPT) -> AgentState``.
- ``run(graph, user_message, config=None) -> AgentState`` invokes the graph
  and returns the final state (or the interrupted state).
"""

from __future__ import annotations

import time
from typing import Any, Callable, TypedDict

from agent.mcp_tools import MCPToolSource
from tools.provider import Provider

ROUTES = ("lookup", "draft", "approval", "done")

SYSTEM_PROMPT = (
    "You are the donor-operations assistant for Lakeshore Food Pantry. Look donors up through the "
    "tools before answering. Receipts are writes and always wait for a person's approval."
)

ROUTING_PROMPT = (
    "Decide the next step for this conversation. Answer with exactly one word: "
    "lookup (we still need facts from the CRM), draft (write the thank-you text), "
    "approval (the draft is ready; a person must approve the receipt), or done."
)

DRAFT_PROMPT = "Write the thank-you message now, under 120 words, using only facts from the tool results."


class AgentState(TypedDict, total=False):
    messages: list[dict[str, Any]]
    route: str
    tool_calls: list[str]
    draft: str | None
    approval: dict[str, Any] | None
    requested_at: float | None
    done: bool


def initial_state(user_message: str, system_prompt: str = SYSTEM_PROMPT) -> AgentState:
    return {
        "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_message}],
        "route": "",
        "tool_calls": [],
        "draft": None,
        "approval": None,
        "requested_at": None,
        "done": False,
    }


def build_graph(provider: Provider, tools: MCPToolSource, *, checkpointer: Any = None, clock: Callable[[], float] = time.time):
    raise NotImplementedError("Lesson m7-1: implement build_graph in agent/graph.py")


def run(graph: Any, user_message: str, config: dict[str, Any] | None = None) -> AgentState:
    raise NotImplementedError("Lesson m7-1: implement run in agent/graph.py")
