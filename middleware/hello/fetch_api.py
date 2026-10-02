"""Lesson m0-1: fetch a JSON API and print one field.

Usage::

    uv run python -m hello.fetch_api <url> --field <name>

Behavior the check expects:

- GET the url with httpx (timeout 5 s) and parse the JSON body.
- Print exactly one line of JSON to stdout::

      {"url": "<url>", "field": "<name>", "value": <the field's value>}

- When the field is missing from the body, print ``{"error": "missing_field",
  "field": "<name>"}`` to stderr and exit 2.
- When the response is not 2xx, print ``error: HTTP <status>`` to stderr
  and exit 1. No traceback: an HTTP error is an expected outcome, not a
  crash. (Try a bad URL once without handling it, read the traceback from
  the bottom up, then add the handling.)

Try it against the mock CRM (start it with ``uv run python -m mock_services
crm --port 8001``) and against any public JSON API you like.
"""

from __future__ import annotations

import sys


def main(argv: list[str] | None = None) -> int:
    """Parse argv, fetch, print. Returns the exit code."""
    raise NotImplementedError("Lesson m0-1: implement main() in hello/fetch_api.py")


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
