#!/usr/bin/env bash
# Atualiza a aplicação na VPS a partir do GitHub.
# Uso (como o usuário dono de /var/www/turismo):  ./deploy/deploy.sh
set -euo pipefail

APP_DIR="/var/www/turismo"
cd "$APP_DIR"

echo "==> git pull"
git pull --ff-only origin main

echo "==> dependências"
npm ci

# As imagens enviadas pelo painel moram aqui. Fica fora do git de propósito,
# então precisa existir no servidor — e sobrevive aos deploys, já que este
# script só faz pull e build, nunca apaga a pasta do projeto.
echo "==> pasta de uploads"
mkdir -p "${UPLOAD_DIR:-$APP_DIR/uploads}"

echo "==> prisma client + migrações"
npm run db:generate
npm run db:deploy

echo "==> build"
npm run build

echo "==> reload"
# reload = sem downtime; se o processo ainda não existe, sobe pela primeira vez.
pm2 reload turismo || pm2 start ecosystem.config.cjs
pm2 save

echo "==> ok"
pm2 status turismo
