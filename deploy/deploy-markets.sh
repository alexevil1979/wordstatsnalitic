#!/usr/bin/env bash
set -euo pipefail
cd /ssd/www/wordstat
git config --global --add safe.directory /ssd/www/wordstat || true
git fetch origin
git reset --hard origin/main
npm install
npm run build
chown -R www-data:www-data /ssd/www/wordstat
systemctl restart wordstat
sleep 2
systemctl is-active wordstat
# kick background full refresh (long-running)
nohup npm run trends:refresh >> /var/log/wordstat-trends.log 2>&1 &
echo "refresh pid $!"
curl -sI https://wordstat.1tlt.ru/ru/markets | head -8
echo DONE
