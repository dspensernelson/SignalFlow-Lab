"""Model provider wrapper. Ships complete: this is plumbing, not a lesson.

One environment variable, ``LLM_PROVIDER``, selects which model answers the
tool-call loop (Module 1) and the agent (Module 7):

    gemini      Google Gemini free tier       GEMINI_API_KEY       GEMINI_MODEL (default gemini-2.5-flash)
    groq        Groq free tier                 GROQ_API_KEY         GROQ_MODEL (default llama-3.3-70b-versatile)
    openrouter  OpenRouter free models         OPENROUTER_API_KEY   OPENROUTER_MODEL (default a ":free" model)
    ollama      local Ollama                   (no key)             OLLAMA_MODEL, OLLAMA_BASE_URL
    replay      recorded replies, no network   LLM_REPLAY_FILE      (used by every deterministic check)

Free tiers change without notice (GitHub Models was retired on 2026-07-30
and is deliberately absent). Swapping providers is a one-line change in
``.env``. Nothing here calls Claude: Claude Code is the pair programmer, not
the model inside the build.

Wire format, provider-agnostic
------------------------------
``complete(messages, tools)`` takes OpenAI-style chat messages::

    {"role": "system" | "user" | "assistant", "content": "..."}
    {"role": "assistant", "content": None, "tool_calls": [{"id", "name", "arguments"}]}
    {"role": "tool", "tool_call_id": "...", "name": "...", "content": "<json string>"}

and tool specs ``{"name", "description", "input_schema"}`` (JSON Schema), and
returns a ``ModelReply``. The loop in ``tools/loop.py`` never sees a
provider's native format.
"""

from __future__ import annotations

import json
import os
import uuid
from pathlib import Path
from typing import Any, Protocol

import httpx
from pydantic import BaseModel, Field


class ToolCall(BaseModel):
    id: str
    name: str
    arguments: dict[str, Any] = Field(default_factory=dict)


class ModelReply(BaseModel):
    """What the model said this turn: text, tool calls, or both."""

    text: str | None = None
    tool_calls: list[ToolCall] = Field(default_factory=list)
    stop_reason: str = "stop"  # "stop" | "tool_calls" | "length" | "replay_exhausted"
    raw: dict[str, Any] | None = None

    @property
    def wants_tools(self) -> bool:
        return bool(self.tool_calls)


class ProviderError(RuntimeError):
    """A provider could not answer (bad key, rate limit, network)."""


class Provider(Protocol):
    name: str

    def complete(self, messages: list[dict[str, Any]], tools: list[dict[str, Any]]) -> ModelReply: ...


# ---------------------------------------------------------------------------
# Replay: recorded replies, in order. The deterministic backbone of the checks.
# ---------------------------------------------------------------------------


class ReplayProvider:
    """Returns scripted replies in order, then a final text reply.

    ``script`` entries are dicts shaped like ModelReply: ``{"text": ...}`` or
    ``{"tool_calls": [{"name": ..., "arguments": {...}}]}``. Ids are filled in.
    Every call is recorded in ``calls`` (messages + tools) so a check can
    assert what the loop sent back to the model.
    """

    name = "replay"

    def __init__(self, script: list[dict[str, Any]], *, exhausted_text: str = "(replay exhausted)"):
        self.script = [self._normalize(s) for s in script]
        self.calls: list[dict[str, Any]] = []
        self.exhausted_text = exhausted_text
        self._i = 0

    @staticmethod
    def _normalize(entry: dict[str, Any]) -> ModelReply:
        calls = [
            ToolCall(id=tc.get("id") or f"call_{uuid.uuid4().hex[:8]}", name=tc["name"], arguments=tc.get("arguments", {}))
            for tc in entry.get("tool_calls", [])
        ]
        return ModelReply(
            text=entry.get("text"),
            tool_calls=calls,
            stop_reason="tool_calls" if calls else "stop",
        )

    @classmethod
    def from_file(cls, path: str | Path) -> "ReplayProvider":
        data = json.loads(Path(path).read_text(encoding="utf-8"))
        return cls(data["replies"] if isinstance(data, dict) else data)

    def complete(self, messages: list[dict[str, Any]], tools: list[dict[str, Any]]) -> ModelReply:
        self.calls.append({"messages": [dict(m) for m in messages], "tools": [dict(t) for t in tools]})
        if self._i < len(self.script):
            reply = self.script[self._i]
            self._i += 1
            return reply
        return ModelReply(text=self.exhausted_text, stop_reason="replay_exhausted")


# ---------------------------------------------------------------------------
# OpenAI-compatible chat completions: Groq, OpenRouter, Ollama.
# ---------------------------------------------------------------------------


def _to_openai_tools(tools: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "type": "function",
            "function": {"name": t["name"], "description": t.get("description", ""), "parameters": t["input_schema"]},
        }
        for t in tools
    ]


def _to_openai_messages(messages: list[dict[str, Any]]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for m in messages:
        if m["role"] == "assistant" and m.get("tool_calls"):
            out.append(
                {
                    "role": "assistant",
                    "content": m.get("content"),
                    "tool_calls": [
                        {
                            "id": tc["id"],
                            "type": "function",
                            "function": {"name": tc["name"], "arguments": json.dumps(tc.get("arguments", {}))},
                        }
                        for tc in m["tool_calls"]
                    ],
                }
            )
        elif m["role"] == "tool":
            out.append({"role": "tool", "tool_call_id": m["tool_call_id"], "content": m["content"]})
        else:
            out.append({"role": m["role"], "content": m.get("content") or ""})
    return out


class OpenAICompatibleProvider:
    def __init__(self, name: str, base_url: str, model: str, api_key: str | None, timeout: float = 60.0):
        self.name = name
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.api_key = api_key
        self.timeout = timeout

    def complete(self, messages: list[dict[str, Any]], tools: list[dict[str, Any]]) -> ModelReply:
        headers = {"content-type": "application/json"}
        if self.api_key:
            headers["authorization"] = f"Bearer {self.api_key}"
        body: dict[str, Any] = {"model": self.model, "messages": _to_openai_messages(messages), "temperature": 0}
        if tools:
            body["tools"] = _to_openai_tools(tools)
            body["tool_choice"] = "auto"
        try:
            with httpx.Client(timeout=self.timeout) as http:
                r = http.post(f"{self.base_url}/chat/completions", json=body, headers=headers)
        except httpx.HTTPError as e:  # pragma: no cover - network
            raise ProviderError(f"{self.name}: {e}") from e
        if r.status_code >= 400:
            raise ProviderError(f"{self.name}: HTTP {r.status_code}: {r.text[:300]}")
        data = r.json()
        choice = data["choices"][0]
        msg = choice["message"]
        calls = []
        for tc in msg.get("tool_calls") or []:
            fn = tc["function"]
            try:
                args = json.loads(fn.get("arguments") or "{}")
            except json.JSONDecodeError:
                args = {"_raw": fn.get("arguments")}
            calls.append(ToolCall(id=tc.get("id") or f"call_{uuid.uuid4().hex[:8]}", name=fn["name"], arguments=args))
        finish = choice.get("finish_reason") or "stop"
        return ModelReply(
            text=msg.get("content"),
            tool_calls=calls,
            stop_reason="tool_calls" if calls else ("length" if finish == "length" else "stop"),
            raw=data,
        )


# ---------------------------------------------------------------------------
# Gemini: its own REST shape (function declarations / functionCall parts).
# ---------------------------------------------------------------------------


class GeminiProvider:
    name = "gemini"

    def __init__(self, api_key: str, model: str = "gemini-2.5-flash", timeout: float = 60.0):
        self.api_key = api_key
        self.model = model
        self.timeout = timeout

    def _contents(self, messages: list[dict[str, Any]]) -> tuple[str | None, list[dict[str, Any]]]:
        system: str | None = None
        contents: list[dict[str, Any]] = []
        for m in messages:
            if m["role"] == "system":
                system = (system + "\n" if system else "") + (m.get("content") or "")
            elif m["role"] == "user":
                contents.append({"role": "user", "parts": [{"text": m.get("content") or ""}]})
            elif m["role"] == "assistant":
                parts: list[dict[str, Any]] = []
                if m.get("content"):
                    parts.append({"text": m["content"]})
                for tc in m.get("tool_calls") or []:
                    parts.append({"functionCall": {"name": tc["name"], "args": tc.get("arguments", {})}})
                contents.append({"role": "model", "parts": parts or [{"text": ""}]})
            elif m["role"] == "tool":
                try:
                    response = json.loads(m["content"])
                except (json.JSONDecodeError, TypeError):
                    response = {"result": m["content"]}
                if not isinstance(response, dict):
                    response = {"result": response}
                contents.append(
                    {"role": "user", "parts": [{"functionResponse": {"name": m.get("name", "tool"), "response": response}}]}
                )
        return system, contents

    def complete(self, messages: list[dict[str, Any]], tools: list[dict[str, Any]]) -> ModelReply:
        system, contents = self._contents(messages)
        body: dict[str, Any] = {"contents": contents, "generationConfig": {"temperature": 0}}
        if system:
            body["systemInstruction"] = {"parts": [{"text": system}]}
        if tools:
            body["tools"] = [
                {
                    "functionDeclarations": [
                        {"name": t["name"], "description": t.get("description", ""), "parameters": _strip_schema(t["input_schema"])}
                        for t in tools
                    ]
                }
            ]
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"
        try:
            with httpx.Client(timeout=self.timeout) as http:
                r = http.post(url, json=body, headers={"x-goog-api-key": self.api_key})
        except httpx.HTTPError as e:  # pragma: no cover - network
            raise ProviderError(f"gemini: {e}") from e
        if r.status_code >= 400:
            raise ProviderError(f"gemini: HTTP {r.status_code}: {r.text[:300]}")
        data = r.json()
        parts = (((data.get("candidates") or [{}])[0].get("content") or {}).get("parts")) or []
        text_parts = [p["text"] for p in parts if "text" in p]
        calls = [
            ToolCall(id=f"call_{uuid.uuid4().hex[:8]}", name=p["functionCall"]["name"], arguments=p["functionCall"].get("args") or {})
            for p in parts
            if "functionCall" in p
        ]
        return ModelReply(
            text="\n".join(text_parts) if text_parts else None,
            tool_calls=calls,
            stop_reason="tool_calls" if calls else "stop",
            raw=data,
        )


def _strip_schema(schema: dict[str, Any]) -> dict[str, Any]:
    """Gemini rejects some JSON Schema keywords pydantic emits (title, $defs,
    additionalProperties). Remove them recursively; semantics survive."""
    drop = {"title", "$defs", "additionalProperties", "default"}
    if isinstance(schema, dict):
        return {k: _strip_schema(v) for k, v in schema.items() if k not in drop}
    if isinstance(schema, list):
        return [_strip_schema(v) for v in schema]
    return schema


# ---------------------------------------------------------------------------
# Factory
# ---------------------------------------------------------------------------

PROVIDER_KEY_ENV = {"gemini": "GEMINI_API_KEY", "groq": "GROQ_API_KEY", "openrouter": "OPENROUTER_API_KEY"}


def get_provider(name: str | None = None) -> Provider:
    """Build the provider named by ``name`` or ``LLM_PROVIDER`` (default replay)."""
    name = (name or os.environ.get("LLM_PROVIDER") or "replay").strip().lower()
    if name == "replay":
        path = os.environ.get("LLM_REPLAY_FILE")
        if path:
            return ReplayProvider.from_file(path)
        return ReplayProvider([])
    if name == "gemini":
        return GeminiProvider(_require_key("GEMINI_API_KEY"), os.environ.get("GEMINI_MODEL", "gemini-2.5-flash"))
    if name == "groq":
        return OpenAICompatibleProvider(
            "groq", "https://api.groq.com/openai/v1", os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile"), _require_key("GROQ_API_KEY")
        )
    if name == "openrouter":
        return OpenAICompatibleProvider(
            "openrouter",
            "https://openrouter.ai/api/v1",
            os.environ.get("OPENROUTER_MODEL", "meta-llama/llama-3.3-70b-instruct:free"),
            _require_key("OPENROUTER_API_KEY"),
        )
    if name == "ollama":
        base = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
        return OpenAICompatibleProvider("ollama", f"{base}/v1", os.environ.get("OLLAMA_MODEL", "llama3.2"), None)
    raise ProviderError(f"unknown LLM_PROVIDER {name!r}; expected gemini|groq|openrouter|ollama|replay")


def _require_key(env: str) -> str:
    value = os.environ.get(env)
    if not value:
        raise ProviderError(f"{env} is not set")
    return value
