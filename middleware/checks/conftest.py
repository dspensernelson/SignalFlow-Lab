"""Shared fixtures for every acceptance check in the middleware track.

The mock services start in background threads on free ports, once per test
session, and their base URLs are exported as environment variables the
learner's code reads (``CRM_URL``, ``EMAIL_URL``, ``PAYMENTS_URL``). Each
test that mutates state calls the service's ``/_reset`` through the
``fresh_*`` fixtures.

Markers (declared in pyproject.toml):

- ``live``      skipped unless LLM_PROVIDER names a provider whose key is set
- ``docker``    skipped unless DOCKER_AVAILABLE=1
- ``deployed``  skipped unless DEPLOY_URL is set
"""

from __future__ import annotations

import os
import socket
import sys
import threading
import time
from pathlib import Path

import httpx
import pytest
import uvicorn

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from mock_services import create_crm_app, create_email_app, create_payments_app  # noqa: E402

PROVIDER_KEY_ENV = {
    "gemini": "GEMINI_API_KEY",
    "groq": "GROQ_API_KEY",
    "openrouter": "OPENROUTER_API_KEY",
    "ollama": None,  # local, no key
}


def free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


class ServiceHandle:
    def __init__(self, name: str, app, port: int):
        self.name = name
        self.port = port
        self.base_url = f"http://127.0.0.1:{port}"
        config = uvicorn.Config(app, host="127.0.0.1", port=port, log_level="error", lifespan="off")
        self.server = uvicorn.Server(config)
        self.thread = threading.Thread(target=self.server.run, name=f"mock-{name}", daemon=True)

    def start(self, timeout: float = 10.0) -> "ServiceHandle":
        self.thread.start()
        deadline = time.time() + timeout
        while time.time() < deadline:
            try:
                if httpx.get(f"{self.base_url}/health", timeout=0.5).status_code == 200:
                    return self
            except httpx.HTTPError:
                time.sleep(0.05)
        raise RuntimeError(f"mock {self.name} did not start on port {self.port}")

    def stop(self) -> None:
        self.server.should_exit = True
        self.thread.join(timeout=5)

    def reset(self) -> None:
        httpx.post(f"{self.base_url}/_reset", timeout=5).raise_for_status()


@pytest.fixture(scope="session")
def mock_crm(tmp_path_factory) -> ServiceHandle:
    db = tmp_path_factory.mktemp("crm") / "crm.db"
    handle = ServiceHandle("crm", create_crm_app(db), free_port()).start()
    os.environ["CRM_URL"] = handle.base_url
    yield handle
    handle.stop()


@pytest.fixture(scope="session")
def mock_email() -> ServiceHandle:
    handle = ServiceHandle("email", create_email_app(), free_port()).start()
    os.environ["EMAIL_URL"] = handle.base_url
    yield handle
    handle.stop()


@pytest.fixture(scope="session")
def mock_payments() -> ServiceHandle:
    os.environ.setdefault("PAYMENTS_TIMEOUT_SLEEP", "3")
    handle = ServiceHandle("payments", create_payments_app(), free_port()).start()
    os.environ["PAYMENTS_URL"] = handle.base_url
    yield handle
    handle.stop()


@pytest.fixture
def fresh_crm(mock_crm) -> ServiceHandle:
    mock_crm.reset()
    return mock_crm


@pytest.fixture
def fresh_email(mock_email) -> ServiceHandle:
    mock_email.reset()
    return mock_email


@pytest.fixture
def fresh_payments(mock_payments) -> ServiceHandle:
    mock_payments.reset()
    return mock_payments


@pytest.fixture
def tmp_db(tmp_path) -> Path:
    """An empty SQLite path the learner's state code can own."""
    return tmp_path / "state.db"


def live_provider_available() -> bool:
    provider = os.environ.get("LLM_PROVIDER", "").strip().lower()
    if provider not in PROVIDER_KEY_ENV:
        return False
    key_env = PROVIDER_KEY_ENV[provider]
    return key_env is None or bool(os.environ.get(key_env))


def pytest_collection_modifyitems(config, items):
    skip_live = pytest.mark.skip(reason="no live model: set LLM_PROVIDER and its API key")
    skip_docker = pytest.mark.skip(reason="no Docker: set DOCKER_AVAILABLE=1 when a daemon is running")
    skip_deployed = pytest.mark.skip(reason="no deployment: set DEPLOY_URL to the deployed server")
    for item in items:
        if "live" in item.keywords and not live_provider_available():
            item.add_marker(skip_live)
        if "docker" in item.keywords and os.environ.get("DOCKER_AVAILABLE") != "1":
            item.add_marker(skip_docker)
        if "deployed" in item.keywords and not os.environ.get("DEPLOY_URL"):
            item.add_marker(skip_deployed)
