#!/bin/sh
set -e

AGENT_HOST_URL="${DOCKER_URL_AGENT:-http://localhost:${DOCKER_PUBLISHED_PORT_AGENT:-5000}}"
SERVER_HOST_URL="${DOCKER_URL_SERVER:-http://localhost:8000}"
SOCKET_URL="${SERVER_SOCKET_URL:-<unset>}"
DB_PATH="${AGENT_DB_PATH:-/data/agent.db}"

printf '\n=== vending-pi (hardware agent) ===\n'
printf 'host.url=%s | server.url=%s\n' "$AGENT_HOST_URL" "$SERVER_HOST_URL"
printf 'ws.url=%s | db.local=%s\n' "$SOCKET_URL" "$DB_PATH"
printf 'machine.code=%s | dispatch=socket-only\n\n' "${MACHINE_CODE:-<unset>}"

exec python agent.py
