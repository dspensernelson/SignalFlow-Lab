"""Run one mock service from the command line.

    uv run python -m mock_services crm --port 8001 [--db crm.db]
    uv run python -m mock_services email --port 8002
    uv run python -m mock_services payments --port 8003
"""

from __future__ import annotations

import argparse

import uvicorn

from . import create_crm_app, create_email_app, create_payments_app


def main() -> None:
    parser = argparse.ArgumentParser(prog="mock_services")
    parser.add_argument("service", choices=["crm", "email", "payments"])
    parser.add_argument("--port", type=int, default=8001)
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--db", default="crm.db", help="SQLite path for the crm service")
    args = parser.parse_args()

    if args.service == "crm":
        app = create_crm_app(args.db)
    elif args.service == "email":
        app = create_email_app()
    else:
        app = create_payments_app()
    uvicorn.run(app, host=args.host, port=args.port, log_level="warning")


if __name__ == "__main__":
    main()
