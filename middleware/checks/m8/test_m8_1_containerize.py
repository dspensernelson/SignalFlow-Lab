"""Check m8-1: the Dockerfile follows the required shape, the compose file
declares the stack, and (with a Docker daemon) `docker compose up` answers
the health check."""

from __future__ import annotations

import json
import os
import re
import subprocess
import time
from pathlib import Path

import httpx
import pytest
import yaml

DEPLOY = Path(__file__).resolve().parents[2] / "deploy"
DOCKERFILE = DEPLOY / "Dockerfile"
COMPOSE = DEPLOY / "compose.yaml"


def test_dockerfile_shape():
    text = DOCKERFILE.read_text(encoding="utf-8")
    assert "TODO" not in text
    assert re.search(r"^FROM python:3\.1[1-3]-slim", text, re.M), "base on python:3.11-slim or newer slim"
    assert re.search(r"COPY .*pyproject\.toml.*uv\.lock", text) or re.search(r"COPY .*uv\.lock.*pyproject\.toml", text), "copy the lock first so the layer caches"
    assert "uv sync" in text and "USER " in text and "HEALTHCHECK" in text
    assert "http_server" in text, "run the Streamable HTTP server"
    assert "/health" in text


def test_compose_declares_the_stack():
    data = yaml.safe_load(COMPOSE.read_text(encoding="utf-8"))
    services = data.get("services") or {}
    assert "middleware" in services and "crm" in services, "declare the middleware and the mock crm"
    mw = services["middleware"]
    assert mw.get("build"), "middleware must build from this repo"
    assert any(str(p).startswith("8080") for p in mw.get("ports", [])), "publish port 8080"
    assert any("/data" in str(v) for v in mw.get("volumes", [])), "mount the state volume at /data"
    assert "healthcheck" in mw
    assert "state" in (data.get("volumes") or {})


@pytest.mark.docker
def test_compose_up_passes_the_health_check():
    env = {**os.environ, "COMPOSE_PROJECT_NAME": "lsfp-check"}
    subprocess.run(["docker", "compose", "-f", str(COMPOSE), "up", "-d", "--build"], check=True, cwd=DEPLOY, env=env, timeout=600)
    try:
        deadline = time.time() + 90
        while time.time() < deadline:
            out = subprocess.run(["docker", "compose", "-f", str(COMPOSE), "ps", "--format", "json"], capture_output=True, text=True, cwd=DEPLOY, env=env).stdout
            rows = [json.loads(line) for line in out.splitlines() if line.strip()]
            mw = next((r for r in rows if r.get("Service") == "middleware"), None)
            if mw and "healthy" in (mw.get("Health") or mw.get("Status") or ""):
                break
            time.sleep(3)
        else:
            pytest.fail("middleware never became healthy")
        assert httpx.get("http://127.0.0.1:8080/health", timeout=5).status_code == 200
    finally:
        subprocess.run(["docker", "compose", "-f", str(COMPOSE), "down", "-v"], cwd=DEPLOY, env=env, timeout=120)
