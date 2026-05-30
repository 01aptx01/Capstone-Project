#!/bin/sh
set -e

AGENT_HOST_URL="${DOCKER_URL_AGENT:-http://localhost:${DOCKER_PUBLISHED_PORT_AGENT:-5000}}"
SERVER_HOST_URL="${DOCKER_URL_SERVER:-http://localhost:8000}"

MACHINE_ID="${MACHINE_ID:-${MACHINE_CODE:-}}"
SOCKET_URL="${SERVER_SOCKET_URL:-${SERVER_URL:-}}"
EVENT_SINK_MODE="${EVENT_SINK_MODE:-socket}"
EVENT_SINK_URL="${EVENT_SINK_URL:-<unset>}"
DB_PATH="${AGENT_DB_PATH:-/data/agent.db}"

# Keep output compact and aligned for `docker compose logs`
printf '\n=== vending-pi (hardware agent) ===\n'
printf 'host.url=%s | server.url=%s\n' "$AGENT_HOST_URL" "$SERVER_HOST_URL"
printf 'ws.url=%s | db.local=%s\n' "${SOCKET_URL:-<unset>}" "$DB_PATH"
printf 'machine.id=%s | sink.mode=%s | sink.url=%s\n\n' "${MACHINE_ID:-<unset>}" "$EVENT_SINK_MODE" "$EVENT_SINK_URL"

exec python agent.py