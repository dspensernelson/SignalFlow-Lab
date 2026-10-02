"""Check m3-1: settings come from the environment as SecretStr, never print,
and the redacting filter scrubs every known secret from log output."""

from __future__ import annotations

import logging

import pytest

from tools.redact import REDACTED, RedactingFilter, install_redaction
from tools.settings import Settings, load_settings

SECRET = "lsfp_key_9b1c2d3e4f_never_log"
LLM_KEY = "gsk_live_abcdef0123456789"
TOKENS = "staff-read-tok:donors:read;staff-write-tok:donors:read,donors:write"


@pytest.fixture
def env(monkeypatch, tmp_path):
    monkeypatch.setenv("CRM_API_KEY", SECRET)
    monkeypatch.setenv("LLM_PROVIDER", "groq")
    monkeypatch.setenv("GROQ_API_KEY", LLM_KEY)
    monkeypatch.setenv("MCP_TOKENS", TOKENS)
    monkeypatch.setenv("CRM_URL", "http://127.0.0.1:9")
    empty = tmp_path / ".env"
    empty.write_text("", encoding="utf-8")
    return str(empty)


def test_settings_load_and_never_print_secrets(env):
    s = load_settings(dotenv_path=env)
    assert isinstance(s, Settings)
    assert s.crm_url == "http://127.0.0.1:9"
    assert s.crm_api_key.get_secret_value() == SECRET
    assert s.llm_provider == "groq" and s.llm_api_key.get_secret_value() == LLM_KEY
    for rendered in (repr(s), str(s), s.model_dump_json()):
        assert SECRET not in rendered and LLM_KEY not in rendered and "staff-write-tok" not in rendered


def test_missing_crm_key_is_a_clear_error(monkeypatch, env):
    monkeypatch.delenv("CRM_API_KEY")
    with pytest.raises(ValueError) as info:
        load_settings(dotenv_path=env)
    assert "CRM_API_KEY" in str(info.value)


def test_secret_values_cover_every_secret_including_each_token(env):
    values = load_settings(dotenv_path=env).secret_values()
    assert SECRET in values and LLM_KEY in values
    assert "staff-read-tok" in values and "staff-write-tok" in values
    assert "" not in values


def test_filter_redacts_message_and_args():
    flt = RedactingFilter([SECRET, "abc"])  # "abc" is too short and must be ignored
    rec = logging.LogRecord("t", logging.INFO, __file__, 1, "key=%s user=%s", (SECRET, "abc"), None)
    assert flt.filter(rec) is True
    assert rec.getMessage() == f"key={REDACTED} user=abc"
    rec2 = logging.LogRecord("t", logging.INFO, __file__, 1, f"inline {SECRET} twice {SECRET}", None, None)
    flt.filter(rec2)
    assert rec2.getMessage() == f"inline {REDACTED} twice {REDACTED}"


def test_installed_redaction_scrubs_captured_logs(env, caplog):
    caplog.set_level(logging.DEBUG)
    settings = load_settings(dotenv_path=env)
    flt = install_redaction(settings.secret_values())
    try:
        logging.getLogger("middleware.anything").info("calling CRM with key %s", settings.crm_api_key.get_secret_value())
        logging.getLogger("middleware.auth").warning("rejected token staff-write-tok")
    finally:
        logging.getLogger().removeFilter(flt)
        for h in logging.getLogger().handlers:
            h.removeFilter(flt)
    assert SECRET not in caplog.text and "staff-write-tok" not in caplog.text
    assert caplog.text.count(REDACTED) >= 2
