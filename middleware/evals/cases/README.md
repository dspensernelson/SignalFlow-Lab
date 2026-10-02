# Eval cases (lessons m6-2 and m6-3)

One JSON file per case, shape documented in `evals/runner.py`. Write at
least 20 regular cases (`"adversarial": false`) covering every tool, both
Marias, a lapsed donor, a missing donor, a malformed date, a duplicate
call, a receipt request (which must end as pending_approval, never a sent
receipt), and at least 5 adversarial cases (`"adversarial": true`) in which
the retrieved text (donor 6's notes, a policy chunk you edit in the case's
replay, a pasted email) carries a directive. Case ids are the file names.

Run: `uv run --directory middleware python -m evals.runner`
