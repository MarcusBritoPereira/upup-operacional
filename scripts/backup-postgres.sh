#!/bin/bash
set -euo pipefail

COMPOSE_FILE=${COMPOSE_FILE:-docker-compose.prod.yml}
ENV_FILE=${ENV_FILE:-.env.production}
COMPOSE_ENV_ARGS=()

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
  COMPOSE_ENV_ARGS=(--env-file "$ENV_FILE")
fi

BACKUP_DIR=${BACKUP_DIR:-./backups}
TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)
BACKUP_FILE="$BACKUP_DIR/upup-operacional-$TIMESTAMP.dump"

mkdir -p "$BACKUP_DIR"

echo "📦 Criando backup PostgreSQL em $BACKUP_FILE"
docker compose "${COMPOSE_ENV_ARGS[@]}" -f "$COMPOSE_FILE" exec -T postgres \
  pg_dump -U "${POSTGRES_USER:?POSTGRES_USER is required}" \
  -d "${POSTGRES_DB:?POSTGRES_DB is required}" \
  -Fc > "$BACKUP_FILE"

echo "✅ Backup criado: $BACKUP_FILE"
