# Wordstat — Market Demand Intelligence

Аналитический MVP по спросу на IT-услуги и цифровые товары по странам (экспертные оценки 2025–2026).

## Stack

- Next.js 15 + TypeScript + Tailwind CSS
- SQLite + Drizzle ORM
- next-intl (RU/EN)
- TanStack Table, CSV/Excel export

## Local setup

```bash
npm install
npm run db:seed
npm run dev
```

Откройте [http://localhost:3000/ru](http://localhost:3000/ru).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run db:generate-opps` | Генерация seed opportunities JSON |
| `npm run db:seed` | Пересоздание SQLite из seed |
| `npm run build` | Production build |
| `npm start` | Start on `127.0.0.1:3010` |

## Deploy

Домен: `wordstat.1tlt.ru`  
Путь на VPS: `/ssd/www/wordstat`

```bash
git pull
npm ci
npm run db:seed
npm run build
systemctl restart wordstat
```

Данные помечены `source: expert_estimate`. Провайдеры DataForSEO / Ahrefs / Trends — stubs в `src/lib/providers`.
