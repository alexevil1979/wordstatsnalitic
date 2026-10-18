# Wordstat → Production SaaS Plan

## 1. Product model (defaults — adjustable in admin)

| Tier | Price (start) | Access |
|------|---------------|--------|
| **Free** | $0 | Google Trends only (pytrends). Daily caps. Shared Markets overview. No paid API providers. |
| **Pro** | **$29/mo** (≈ 2 490 ₽) — changeable in admin before launch | Personal SerpAPI / DataForSEO / Ahrefs keys (encrypted). Higher limits. Personal research history. Unlimited-ish XML/CSV export. |
| **Business** (phase 2) | $99/mo | Team seats, shared workspace keys, priority jobs |

**Rule:** Free never burns platform money on SerpAPI/Ahrefs. Pro users bring **their own keys**. Platform sells *orchestration, UX, limits, storage, admin* — not resold keyword credits (v1).

**Payments:** Stripe first (international cards). YooKassa later for RU without redesigning `subscriptions`.

---

## 2. Languages (same as hiddifysales.com)

Locales via `next-intl`:

| Code | Language | Notes |
|------|----------|-------|
| `ru` | Русский (default for wordstat.1tlt.ru) | |
| `en` | English | |
| `zh` | 中文 | |
| `tr` | Türkçe | |
| `fa` | فارسی | RTL |
| `ar` | العربية | RTL |

- Switcher in header; persist on user profile when logged in
- `messages/{locale}.json` for UI; niche/insight content as JSON i18n fields in DB
- SEO: `hreflang`, localized titles/descriptions
- Priority translate: auth, markets, cabinet, billing, legal; then admin

---

## 3. Target architecture

```
Browser → Apache SSL → Next.js 15 (App Router)
                         ├ Public: Markets / Insights / Marketing
                         ├ Auth: register / login / verify / reset
                         ├ Cabinet: keys, usage, billing, history
                         ├ Admin: users, payments, plans, jobs, stats
                         └ API: rate-limited, plan-aware providers
                              ↓
                    PostgreSQL + Redis
                              ↓
                    Stripe webhooks
```

**Must leave SQLite** for multi-user + billing. Postgres on VPS (Docker or apt). Redis for rate limits and optional job queues.

**Stack evolution:**
- Auth.js (NextAuth v5) — credentials + email verify; optional Google OAuth
- Drizzle ORM → PostgreSQL
- Stripe Checkout + Customer Portal + webhooks
- AES-GCM for API key ciphertext (`CREDENTIALS_ENCRYPTION_KEY`)
- Roles: `user` | `admin`
- Worker process (optional): `npm run trends:refresh` / per-user jobs

---

## 4. Core data model

- `users` — email, password_hash, locale, role, email_verified_at
- `subscriptions` — plan, status, stripe_customer_id, stripe_subscription_id, period_end
- `user_api_keys` — provider, ciphertext, iv, hint/last4
- `usage_events` — action, units, day bucket for caps + admin analytics
- `opportunities` / `trend_runs` — `user_id` NULL = platform shared; set for personal
- `plans` / `plan_limits` — price cents, caps, features (admin-editable)
- `admin_audit_log` — actor, action, payload

Shared **Markets** page stays the public/free aggregate. Personal keys power personal research + personal catalog rows.

---

## 5. User cabinet (`/[locale]/cabinet`)

1. Overview — plan, usage meters, subscription status  
2. API keys — SerpAPI / DataForSEO / Ahrefs (Pro only; Free sees upgrade CTA)  
3. Research history — personal trend runs  
4. Billing — Upgrade / Stripe Customer Portal  
5. Profile — locale, password, delete account  

Auth routes: `/[locale]/auth/register|login|verify|forgot`

---

## 6. Professional admin (`/[locale]/admin`)

Guard: `role === admin`. New shell (not the old opportunities CRUD alone).

| Module | Purpose |
|--------|---------|
| Dashboard | MRR, new users, churn proxy, Trends calls, errors |
| Users | list, ban, force plan, reset limits |
| Subscriptions | Stripe sync view, past_due, cancel notes |
| Plans & limits | price, daily caps, feature flags |
| Catalog / content | niches, watchlist, insights, shared opportunities |
| Jobs | cron status, manual platform refresh, logs |
| Audit | admin actions |
| System | health (DB, Redis, pytrends), toggles |

Migrate current `/admin` CRUD → **Admin → Catalog**.

---

## 7. Limits (enforced in API)

| Action | Free | Pro |
|--------|------|-----|
| Shared Markets overview | yes | yes |
| Google Trends research | 20/day | 500/day |
| Paid providers (user keys) | no | yes |
| Personal catalog refresh | no | 1/day |
| XML export | 3/day | high cap |
| Concurrent jobs | 1 | 3 |

Implementation: Redis counters `usage:{userId}:{yyyy-mm-dd}:{action}`.

---

## 8. Security / legal minimum

- HTTPS, secure cookies, HSTS  
- Login rate limit; CSRF on auth forms  
- Never log full API keys; never return ciphertext decrypt in list APIs  
- Stripe webhook signature verification  
- Privacy Policy + Terms + Cookies (all 5 locales)  
- Transactional email (Resend or SMTP)  
- Daily Postgres backups  
- Secrets only in env / vault — not git  
- Admin 2FA in phase 1.5  

---

## 9. Infra (wordstat.1tlt.ru)

1. Install Postgres + Redis  
2. systemd: `wordstat` (Next), optional `wordstat-worker`  
3. Env: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `STRIPE_*`, `CREDENTIALS_ENCRYPTION_KEY`, `REDIS_URL`  
4. Later: `stage.wordstat.1tlt.ru`  
5. `/api/health` + uptime check  

---

## 10. Roadmap

### Phase 0 — Foundation (1–1.5 weeks)
- Postgres + Drizzle migrations; import seed  
- Auth.js register/login/verify/reset  
- Roles; protect cabinet/admin stubs  
- Keep shared Markets working  

### Phase 1 — Cabinet + keys + limits + i18n5 (1.5–2 weeks)
- Cabinet UI  
- Encrypted `user_api_keys`  
- Provider router by plan  
- Redis rate limits  
- Locales `de`/`es`/`zh` on core screens  

### Phase 2 — Billing (1 week)
- Stripe products/prices (admin-overridable)  
- Checkout + Portal + webhooks → `subscriptions`  
- Paywall on keys / paid providers  
- Legal pages  

### Phase 3 — Pro admin (1–1.5 weeks)
- Admin dashboard, users, subs, plans, jobs, audit  
- Move catalog CRUD under admin  

### Phase 4 — Soft launch (3–5 days)
- Live Stripe; create first admin  
- E2E: register → free Trends → pay → add key → research  
- Finish i18n gaps on public funnel  
- Landing: Free Trends vs Pro personal APIs  

### Phase 5 — Harden (ongoing)
- YooKassa, admin 2FA, Business plan, staging, alerting  

---

## 11. Out of scope for v1

- Reselling DataForSEO/Ahrefs credits with markup  
- Native mobile apps  
- Full Ahrefs feature parity  
- Multi-tenant white-label  

---

## 12. Commercial ready checklist

- [ ] Register + Pro checkout works in Stripe live  
- [ ] Free cannot call SerpAPI/DataForSEO/Ahrefs  
- [ ] Pro stores key and completes research with it  
- [ ] Admin sees users / MRR proxy / usage  
- [ ] 5 languages on auth + markets + cabinet + billing  
- [ ] DB backups + rollback notes  

---

## 13. Effort

~**5–7 weeks** focused full-stack to soft launch. Pro price editable until go-live.
