"""Lesson m3-1: redaction in the logger.

A secret that reaches a log line is a secret in a file somebody will paste
into a ticket. The fix is structural, not a reminder: a ``logging.Filter``
installed on the root logger rewrites every record's message, replacing any
known secret value with ``[redacted]`` before a handler sees it.

Spec (the check asserts this):

- ``RedactingFilter(secrets: list[str])`` is a ``logging.Filter``; its
  ``filter(record)`` replaces every occurrence of every secret (longest
  first) in the formatted message, including values that arrived through
  ``record.args``, and always returns True (it never drops a record);
- ``install_redaction(secrets, logger=None)`` attaches one filter to the
  given logger (default: the root logger) and to every handler already on
  it, and returns the filter so tests can remove it;
- a partial-match secret shorter than 4 characters is ignored (it would
  redact ordinary words).
"""

from __future__ import annotations

import logging

REDACTED = "[redacted]"


class RedactingFilter(logging.Filter):
    def __init__(self, secrets: list[str]):
        super().__init__()
        self.secrets = sorted({s for s in secrets if s and len(s) >= 4}, key=len, reverse=True)

    def filter(self, record: logging.LogRecord) -> bool:
        raise NotImplementedError("Lesson m3-1: implement RedactingFilter.filter in tools/redact.py")


def install_redaction(secrets: list[str], logger: logging.Logger | None = None) -> RedactingFilter:
    raise NotImplementedError("Lesson m3-1: implement install_redaction in tools/redact.py")
