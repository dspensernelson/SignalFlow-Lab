"""Lesson m3-1: one settings module, the only reader of secrets.

Every configuration value the middleware needs comes through here, from the
environment (loaded from a git-ignored ``.env``). Secrets are ``SecretStr``
so they never print, never appear in ``repr``, and never land in a log line
by accident. ``tools/redact.py`` uses ``secret_values()`` to scrub logs.

Spec (the check asserts this):

- ``Settings`` (pydantic BaseModel) with fields:

      crm_url: str               CRM_URL        default http://127.0.0.1:8001
      email_url: str             EMAIL_URL      default http://127.0.0.1:8002
      payments_url: str          PAYMENTS_URL   default http://127.0.0.1:8003
      crm_api_key: SecretStr     CRM_API_KEY    required
      llm_provider: str          LLM_PROVIDER   default "replay"
      llm_api_key: SecretStr | None   the key for the selected provider
                                 (GEMINI_API_KEY / GROQ_API_KEY / OPENROUTER_API_KEY), or None
      mcp_tokens: SecretStr | None    MCP_TOKENS (Module 3.2), or None
      approvals_db: str          APPROVALS_DB   default "approvals.db"

- ``load_settings(dotenv_path=None) -> Settings`` loads ``.env`` (or the
  given path) then the environment; a missing CRM_API_KEY raises
  ``ValueError`` naming it.
- ``Settings.secret_values() -> list[str]`` returns every non-empty secret
  (plain strings) so the redactor can scrub them. Also splits MCP_TOKENS on
  ``;`` and ``:`` so each token value is scrubbed individually.
- ``repr(settings)`` and ``settings.model_dump()`` never contain a secret's
  plain value (pydantic's SecretStr guarantees this if you use it).
- Rotation: changing a value in ``.env`` and restarting is the whole
  procedure; write that down in the module docstring of your implementation.
"""

from __future__ import annotations

from pydantic import BaseModel, SecretStr


class Settings(BaseModel):
    crm_url: str = "http://127.0.0.1:8001"
    email_url: str = "http://127.0.0.1:8002"
    payments_url: str = "http://127.0.0.1:8003"
    crm_api_key: SecretStr
    llm_provider: str = "replay"
    llm_api_key: SecretStr | None = None
    mcp_tokens: SecretStr | None = None
    approvals_db: str = "approvals.db"

    def secret_values(self) -> list[str]:
        raise NotImplementedError("Lesson m3-1: implement Settings.secret_values")


def load_settings(dotenv_path: str | None = None) -> Settings:
    raise NotImplementedError("Lesson m3-1: implement load_settings in tools/settings.py")
