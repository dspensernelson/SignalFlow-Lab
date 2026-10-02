"""Self-tests for tools/provider.py (ships complete): the replay provider and
the provider-agnostic -> OpenAI-style message translation. No network."""

from __future__ import annotations

import json

import pytest

from tools.provider import (
    ModelReply,
    OpenAICompatibleProvider,
    ProviderError,
    ReplayProvider,
    _to_openai_messages,
    _to_openai_tools,
    get_provider,
)


def test_replay_returns_script_in_order_then_exhausts():
    p = ReplayProvider([{"tool_calls": [{"name": "find_donor", "arguments": {"query": "Maria"}}]}, {"text": "Done."}])
    r1 = p.complete([{"role": "user", "content": "hi"}], [])
    assert r1.wants_tools and r1.tool_calls[0].name == "find_donor" and r1.tool_calls[0].id
    r2 = p.complete([], [])
    assert r2.text == "Done." and not r2.wants_tools
    r3 = p.complete([], [])
    assert r3.stop_reason == "replay_exhausted"
    assert len(p.calls) == 3


def test_replay_from_file(tmp_path):
    f = tmp_path / "r.json"
    f.write_text(json.dumps({"replies": [{"text": "ok"}]}), encoding="utf-8")
    assert ReplayProvider.from_file(f).complete([], []).text == "ok"


def test_default_provider_is_replay(monkeypatch):
    monkeypatch.delenv("LLM_PROVIDER", raising=False)
    monkeypatch.delenv("LLM_REPLAY_FILE", raising=False)
    assert get_provider().name == "replay"


def test_missing_key_is_a_provider_error(monkeypatch):
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    with pytest.raises(ProviderError):
        get_provider("groq")
    with pytest.raises(ProviderError):
        get_provider("nope")


def test_openai_translation_round_trips_tool_calls():
    messages = [
        {"role": "system", "content": "s"},
        {"role": "user", "content": "u"},
        {"role": "assistant", "content": None, "tool_calls": [{"id": "c1", "name": "find_donor", "arguments": {"query": "x"}}]},
        {"role": "tool", "tool_call_id": "c1", "name": "find_donor", "content": "{\"matches\": 0}"},
    ]
    out = _to_openai_messages(messages)
    assert out[2]["tool_calls"][0]["function"]["arguments"] == json.dumps({"query": "x"})
    assert out[3] == {"role": "tool", "tool_call_id": "c1", "content": "{\"matches\": 0}"}
    tools = _to_openai_tools([{"name": "t", "description": "d", "input_schema": {"type": "object"}}])
    assert tools[0]["function"]["parameters"] == {"type": "object"}


def test_openai_compatible_provider_parses_tool_calls(monkeypatch):
    import httpx

    class FakeResp:
        status_code = 200
        text = ""

        def json(self):
            return {
                "choices": [
                    {
                        "finish_reason": "tool_calls",
                        "message": {
                            "content": None,
                            "tool_calls": [{"id": "c9", "function": {"name": "find_donor", "arguments": "{\"query\": \"Maria\"}"}}],
                        },
                    }
                ]
            }

    class FakeClient:
        def __init__(self, *a, **k):
            pass

        def __enter__(self):
            return self

        def __exit__(self, *a):
            return False

        def post(self, url, json=None, headers=None):
            assert url.endswith("/chat/completions")
            assert headers["authorization"] == "Bearer k"
            return FakeResp()

    monkeypatch.setattr(httpx, "Client", FakeClient)
    p = OpenAICompatibleProvider("groq", "https://x/v1", "m", "k")
    reply = p.complete([{"role": "user", "content": "hi"}], [])
    assert isinstance(reply, ModelReply)
    assert reply.tool_calls[0].arguments == {"query": "Maria"} and reply.stop_reason == "tool_calls"
