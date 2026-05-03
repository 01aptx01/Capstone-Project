#!/bin/sh
set -e
HOST_URL="${DOCKER_HOST_URL:-http://localhost:${DOCKER_PUBLISHED_PORT:-3000}}"
printf '\n=== vending-machine-ui ===\n'
printf '  Host browser:  %s\n' "$HOST_URL"
printf '  Local (in container):   http://127.0.0.1:3000\n'
printf '  Network (listen):       http://0.0.0.0:3000\n\n'
exec npm start
