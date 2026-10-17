#!/usr/bin/env bash
set -euo pipefail
APP_DIR=/ssd/www/wordstat
cd "$APP_DIR"

git fetch origin
git reset --hard origin/main
npm install
npm run build

python3 -m venv .venv
.venv/bin/pip install -U pip
.venv/bin/pip install -r requirements-trends.txt

chown -R www-data:www-data "$APP_DIR"
chmod -R u+rwX,g+rwX "$APP_DIR/data" "$APP_DIR/.venv"

# Ensure trends tables exist (app will also migrate on start)
.venv/bin/python - <<'PY'
import sqlite3, datetime
c = sqlite3.connect("data/wordstat.db")
c.executescript("""
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL
);
""")
now = datetime.datetime.utcnow().isoformat() + "Z"
rows = [
  ("TRENDS_PYTHON", "/ssd/www/wordstat/.venv/bin/python"),
  ("KEYWORD_PROVIDER", "google_trends"),
  ("TRENDS_CACHE_TTL_HOURS", "24"),
]
for k, v in rows:
  c.execute(
    "INSERT INTO app_settings(key,value,updated_at) VALUES(?,?,?) "
    "ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at",
    (k, v, now),
  )
c.commit()
print("settings ok")
PY

CRON_LINE='15 4 * * * cd /ssd/www/wordstat && /usr/bin/npm run trends:refresh >> /var/log/wordstat-trends.log 2>&1'
(crontab -l 2>/dev/null | grep -v 'wordstat-trends' || true; echo "$CRON_LINE") | crontab -

systemctl restart wordstat
sleep 2
systemctl is-active wordstat

echo '{"query":"ai agent","country":"US","timeframe":"now 7-d"}' | .venv/bin/python scripts/trends_client.py | head -c 180
echo
curl -sI https://wordstat.1tlt.ru/ru/research | head -8
echo DONE
