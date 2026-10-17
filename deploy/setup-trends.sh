#!/usr/bin/env bash
set -euo pipefail
APP_DIR=/ssd/www/wordstat
cd "$APP_DIR"

python3 -m venv .venv
.venv/bin/pip install -U pip
.venv/bin/pip install -r requirements-trends.txt

# Point app at venv python (SQLite settings; also write env for systemd)
sqlite3 data/wordstat.db "INSERT INTO app_settings(key,value,updated_at) VALUES('TRENDS_PYTHON','$APP_DIR/.venv/bin/python',datetime('now')) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at;"
sqlite3 data/wordstat.db "INSERT INTO app_settings(key,value,updated_at) VALUES('KEYWORD_PROVIDER','google_trends',datetime('now')) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at;" || true

# Daily catalog refresh at 04:15
CRON_LINE="15 4 * * * cd $APP_DIR && $APP_DIR/.venv/bin/python -c 'print(1)' >/dev/null 2>&1; cd $APP_DIR && /usr/bin/npm run trends:refresh >> /var/log/wordstat-trends.log 2>&1"
(crontab -l 2>/dev/null | grep -v 'wordstat.*trends:refresh' || true; echo "$CRON_LINE") | crontab -

echo "Trends venv + cron installed"
