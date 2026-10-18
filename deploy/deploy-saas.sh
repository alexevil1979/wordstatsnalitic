#!/usr/bin/env bash
set -euo pipefail
cd /ssd/www/wordstat
git config --global --add safe.directory /ssd/www/wordstat || true
git fetch origin
git reset --hard origin/main
npm install
npm run build
# ensure secrets exist
if [ ! -f .env ]; then
  touch .env
fi
grep -q '^AUTH_SECRET=' .env || echo "AUTH_SECRET=$(openssl rand -hex 32)" >> .env
grep -q '^CREDENTIALS_ENCRYPTION_KEY=' .env || echo "CREDENTIALS_ENCRYPTION_KEY=$(openssl rand -hex 32)" >> .env
grep -q '^APP_URL=' .env || echo "APP_URL=https://wordstat.1tlt.ru" >> .env
# Postgres container (optional dual-run; app still on SQLite until cutover)
if command -v docker >/dev/null 2>&1; then
  docker compose up -d postgres redis || true
fi
chown -R www-data:www-data /ssd/www/wordstat
systemctl restart wordstat
sleep 2
systemctl is-active wordstat
curl -sI https://wordstat.1tlt.ru/ru/markets | head -8
curl -sI https://wordstat.1tlt.ru/zh/markets | head -5
curl -sI https://wordstat.1tlt.ru/ar/markets | head -5
echo DONE
