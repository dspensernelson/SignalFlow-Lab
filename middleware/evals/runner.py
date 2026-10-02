"""Lesson m6-2: an eval harness. Golden cases, run offline, every change.

An eval case is a saved conversation: the user message, the model replies
to replay (so the run is deterministic and free), and what must be true
afterwards: which tools ran in what order, that no write was attempted,
that retrieved text reached the model sanitized, that the final answer
contains a phrase. The runner executes the real loop against the mock CRM
with those replies and reports pass/fail per case.

With a real key (``--live``), the same cases run against the real model
and the replay is ignored: that run tells you whether the model, not the
middleware, does the right thing. Offline is the regression gate; live is
the occasional reality check.

Case file (``evals/cases/<id>.json``)::

    {"id": "lookup-by-email", "adversarial": false,
     "user_message": "Find the donor with email maria.alvarez@example.org",
     "replay": [{"tool_calls": [{"name": "find_donor", "arguments": {"query": "maria.alvarez@example.org"}}]},
                {"text": "Maria Alvarez, id 1."}],
     "expect": {"tools": ["find_donor"], "no_write": true,
                "final_contains": "Maria Alvarez", "sanitized": [], "errors": []}}

``expect`` fields (all optional):
    tools:          exact ordered list of executed tool names
    no_write:       true -> the model must not have attempted any write tool
                    (registry Tool.writes); the harness blocks writes anyway,
                    so this is about the attempt, not the effect
    final_contains: substring that must appear in final_text
    sanitized:      strings that must NOT appear in any tool message sent to
                    the model (proves sanitize_result ran)
    errors:         error codes that must appear among the tool results

Spec (the check asserts this):

- ``EvalCase``, ``Expectation``, ``EvalResult(id, passed, reasons:
  list[str], tool_calls: list[str])``, ``Summary(total, passed, failed,
  results)`` are pydantic models.
- ``load_cases(folder=CASES_DIR) -> list[EvalCase]`` reads every ``*.json``.
- ``run_case(case, registry, *, live=False) -> EvalResult`` builds a
  ``ReplayProvider(case.replay)`` (or ``get_provider()`` when live), runs
  ``tools.loop.run_loop``, and checks every expectation, collecting one
  reason per failed expectation.
- ``run_all(cases, registry, *, live=False) -> Summary``.
- ``main(argv)``: ``--cases DIR``, ``--live``, ``--min-pass N``; prints one
  line per case (``PASS id`` / ``FAIL id: reason; reason``) and a summary;
  exit code 1 when passed < min-pass (default: all).
- The write check: wrap the registry so write tools (``Tool.writes``) record
  an attempt and return ``error_result("pending_approval", ...)`` instead of
  executing; ``no_write`` fails when an attempt was recorded.
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Any

from pydantic import BaseModel, Field

from tools.schemas import ToolRegistry

CASES_DIR = Path(__file__).with_name("cases")


class Expectation(BaseModel):
    tools: list[str] | None = None
    no_write: bool = False
    final_contains: str | None = None
    sanitized: list[str] = Field(default_factory=list)
    errors: list[str] = Field(default_factory=list)


class EvalCase(BaseModel):
    id: str
    adversarial: bool = False
    user_message: str
    replay: list[dict[str, Any]]
    expect: Expectation = Field(default_factory=Expectation)


class EvalResult(BaseModel):
    id: str
    passed: bool
    reasons: list[str] = Field(default_factory=list)
    tool_calls: list[str] = Field(default_factory=list)


class Summary(BaseModel):
    total: int
    passed: int
    failed: int
    results: list[EvalResult]


def load_cases(folder: str | Path = CASES_DIR) -> list[EvalCase]:
    raise NotImplementedError("Lesson m6-2: implement load_cases in evals/runner.py")


def run_case(case: EvalCase, registry: ToolRegistry, *, live: bool = False) -> EvalResult:
    raise NotImplementedError("Lesson m6-2: implement run_case in evals/runner.py")


def run_all(cases: list[EvalCase], registry: ToolRegistry, *, live: bool = False) -> Summary:
    raise NotImplementedError("Lesson m6-2: implement run_all in evals/runner.py")


def main(argv: list[str] | None = None) -> int:
    raise NotImplementedError("Lesson m6-2: implement main in evals/runner.py")


if __name__ == "__main__":
    sys.exit(main())
