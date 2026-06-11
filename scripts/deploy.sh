#!/bin/bash
set -euo pipefail

REMOTE=${DEPLOY_REMOTE:-up-finance}
REMOTE_USER=${DEPLOY_REMOTE_USER:-root}
REMOTE_HOST=${DEPLOY_REMOTE_HOST:-195.35.42.219}
DEST_DIR=${DEPLOY_DEST_DIR:-/var/www/upup-operacional}
COMPOSE_FILE=${COMPOSE_FILE:-docker-compose.prod.yml}
ENV_FILE=${ENV_FILE:-.env.production}

if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ Arquivo $ENV_FILE não encontrado. Crie-o com as variáveis obrigatórias de produção."
  exit 1
fi

required_vars=(
  POSTGRES_USER
  POSTGRES_PASSWORD
  POSTGRES_DB
  JWT_SECRET
  CORS_ORIGINS
  COOKIE_SECURE
  CREDENTIALS_ENCRYPTION_KEY
  NEXT_PUBLIC_API_URL
)

for var in "${required_vars[@]}"; do
  if ! grep -Eq "^${var}=" "$ENV_FILE"; then
    echo "❌ Variável obrigatória ausente em $ENV_FILE: $var"
    exit 1
  fi
done

echo "🚀 Iniciando deploy controlado para $REMOTE_HOST"
ssh "$REMOTE" "sudo mkdir -p '$DEST_DIR' '$DEST_DIR/backups' && sudo chown -R '$REMOTE_USER':'$REMOTE_USER' '$DEST_DIR'"

echo "📦 Sincronizando arquivos com rsync..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude 'dist' \
  --exclude '.git' \
  --exclude '.env' \
  --exclude '.env.*' \
  --exclude 'backups' \
  ./ "$REMOTE_USER@$REMOTE_HOST:$DEST_DIR/"

rsync -avz "$ENV_FILE" "$REMOTE_USER@$REMOTE_HOST:$DEST_DIR/.env.production"

echo "🐳 Construindo imagens sem trocar tráfego ainda..."
ssh "$REMOTE" "cd '$DEST_DIR' && docker compose --env-file .env.production -f '$COMPOSE_FILE' build"

echo "💾 Criando backup antes das migrations..."
ssh "$REMOTE" "cd '$DEST_DIR' && docker compose --env-file .env.production -f '$COMPOSE_FILE' up -d postgres && ./scripts/backup-postgres.sh"

echo "🔄 Rodando migrations antes de confirmar a aplicação..."
ssh "$REMOTE" "cd '$DEST_DIR' && docker compose --env-file .env.production -f '$COMPOSE_FILE' run --rm api npx prisma migrate deploy"

echo "🚢 Subindo serviços..."
ssh "$REMOTE" "cd '$DEST_DIR' && docker compose --env-file .env.production -f '$COMPOSE_FILE' up -d --remove-orphans"

echo "🩺 Verificando health checks..."
ssh "$REMOTE" "cd '$DEST_DIR' && docker compose --env-file .env.production -f '$COMPOSE_FILE' ps && curl -fsS http://127.0.0.1:3011/health/ready >/dev/null && curl -fsS http://127.0.0.1:3010/ >/dev/null"

echo "✅ Deploy finalizado com sucesso. Se smoke tests externos falharem, reverta para o commit/imagem anterior e restaure o backup mais recente."
