# Wordstat — Market Demand Intelligence

Аналитика спроса: **live Google Trends** (что ищут люди) + каталог возможностей. Абсолютные keyword volumes — через платные ключи (SerpAPI / DataForSEO / Ahrefs).

## Что умеет

- **Исследование** — запрос + страна + период → interest over time, related top/rising, рекомендация
- **Каталог** — таблица с фильтрами; строки из seed и/или Trends (`source` бейдж)
- **Настройки** — провайдер и API-ключи в SQLite
- **Cron refresh** — `npm run trends:refresh` обновляет watchlist из Trends

## Важно про Google Trends

Trends даёт **относительный интерес 0–100**, не число поисков в месяц. В каталоге volume для Trends-строк = `avgInterest × 100` (proxy для сортировки).

## Local setup

```bash
npm install
python -m venv .venv
# Windows:
.venv\Scripts\pip install -r requirements-trends.txt
# Linux:
.venv/bin/pip install -r requirements-trends.txt

npm run db:seed
npm run dev
```

Откройте `/ru/research` и выполните запрос.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run db:seed` | Seed SQLite |
| `npm run trends:refresh` | Watchlist → Trends → upsert opportunities |
| `npm run build` / `npm start` | Production |

## Env / Settings

См. `.env.example`. Ключи также задаются в UI **Настройки** (без рестарта).

`KEYWORD_PROVIDER=google_trends|serpapi|dataforseo|ahrefs|expert_seed`

## Deploy (VPS)

```bash
cd /ssd/www/wordstat
git pull
npm install
npm run build
bash deploy/setup-trends.sh   # venv + cron
systemctl restart wordstat
```

Домен: https://wordstat.1tlt.ru
