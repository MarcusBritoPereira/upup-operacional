#!/bin/bash
set -e

echo "🚀 Iniciando deploy para a VPS up-finance..."

# Diretório destino na VPS
DEST_DIR="/var/www/upup-operacional"

# Garantir que o diretório exista
ssh up-finance "sudo mkdir -p $DEST_DIR && sudo chown -R root:root $DEST_DIR"

echo "📦 Sincronizando arquivos com rsync..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude 'dist' \
  --exclude '.git' \
  --exclude '.env' \
  ./ root@195.35.42.219:$DEST_DIR/

echo "🐳 Subindo os containers na VPS..."
ssh up-finance "cd $DEST_DIR && docker compose -f docker-compose.prod.yml up -d --build"

echo "🔄 Rodando as migrations do banco de dados..."
# Aguarda 5 segundos para garantir que o BD subiu se for a primeira vez
sleep 5
ssh up-finance "cd $DEST_DIR && docker compose -f docker-compose.prod.yml exec -T api npx prisma migrate deploy"

echo "✅ Deploy finalizado com sucesso!"
