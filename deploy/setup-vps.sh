#!/usr/bin/env bash
set -euo pipefail

APP_DIR=/ssd/www/wordstat
DOMAIN=wordstat.1tlt.ru

cd "$APP_DIR"
npm ci
npm run db:seed
npm run build

chown -R www-data:www-data "$APP_DIR"
chmod -R u+rwX,g+rwX "$APP_DIR/data"

cp "$APP_DIR/deploy/wordstat.service" /etc/systemd/system/wordstat.service
systemctl daemon-reload
systemctl enable wordstat
systemctl restart wordstat

a2enmod proxy proxy_http ssl headers rewrite >/dev/null
cp "$APP_DIR/deploy/apache/wordstat.1tlt.ru.conf" /etc/apache2/sites-available/
cp "$APP_DIR/deploy/apache/wordstat.1tlt.ru-le-ssl.conf" /etc/apache2/sites-available/
a2ensite wordstat.1tlt.ru.conf >/dev/null || true

if [[ ! -d "/etc/letsencrypt/live/${DOMAIN}" ]]; then
  certbot --apache -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email || \
  certbot certonly --webroot -w /var/www/html -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email || true
fi

a2ensite wordstat.1tlt.ru-le-ssl.conf >/dev/null || true
apache2ctl configtest
systemctl reload apache2

systemctl --no-pager --full status wordstat | head -20
curl -sI "http://127.0.0.1:3010/ru" | head -10 || true
echo "Done: https://${DOMAIN}"
