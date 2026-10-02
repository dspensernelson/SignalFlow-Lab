"""Lesson m0-4: a command-line front end for the transform, plus your own tests.

Usage::

    uv run python -m tools.cli transform <event.json> [--out <record.json>]

Behavior the check expects:

- Reads the event JSON file, runs ``tools.transform.webhook_to_donation``,
  and writes the record as JSON (indent 2) to stdout, or to ``--out``.
- Exit codes: 0 on success; 2 when the file is missing, is not JSON, or is
  an unsupported event type (print a one-line reason to stderr, no traceback).

Your own tests live in ``middleware/tests/test_transform.py`` (at least
three: a golden mapping, the unsupported-event error, and the CLI exit
code). The check runs them.
"""

from __future__ import annotations

import typer

app = typer.Typer(no_args_is_help=True, add_completion=False)


@app.callback()
def main() -> None:
    """Donor-ops middleware tools."""


@app.command("transform")
def transform(event_file: str, out: str | None = typer.Option(None, "--out", help="Write the record here")) -> None:
    """Map one webhook event file to a donation record."""
    raise NotImplementedError("Lesson m0-4: implement the transform command")


if __name__ == "__main__":
    app()
