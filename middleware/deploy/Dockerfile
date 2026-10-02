# Lesson m8-1: containerize the donor-ops middleware.
#
# TODO (m8-1): make this build and run. Requirements the check enforces:
# - based on an official python:3.11-slim (or 3.12-slim) image;
# - uv installed and used for the dependency step, with the lock file copied
#   first so the layer caches (COPY pyproject.toml uv.lock ./ then uv sync);
# - the app copied after dependencies; runs as a non-root user;
# - serves the Streamable HTTP server on 0.0.0.0:${PORT:-8080};
# - a HEALTHCHECK that GETs /health (add that route with
#   @server.custom_route("/health", methods=["GET"]) in http_server.py);
# - the state database lives under /data (a volume), via STATE_DB.
FROM python:3.11-slim
WORKDIR /app
# TODO
CMD ["python", "-c", "print('Lesson m8-1: write the Dockerfile')"]
