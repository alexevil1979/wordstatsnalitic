/** Idempotent DDL for Trends + SaaS tables (keeps existing seed data). */
export function ensureTrendsSchema(sqlite: { exec: (sql: string) => unknown }) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS trend_runs (
      id TEXT PRIMARY KEY,
      query TEXT NOT NULL,
      country TEXT NOT NULL,
      provider TEXT NOT NULL,
      timeframe TEXT NOT NULL,
      status TEXT NOT NULL,
      error TEXT,
      avg_interest REAL,
      peak_interest REAL,
      trend_direction TEXT,
      insight_json TEXT,
      created_at TEXT NOT NULL,
      user_id TEXT
    );
    CREATE TABLE IF NOT EXISTS trend_points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id TEXT NOT NULL REFERENCES trend_runs(id),
      date TEXT NOT NULL,
      interest INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS trend_related (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id TEXT NOT NULL REFERENCES trend_runs(id),
      type TEXT NOT NULL,
      query TEXT NOT NULL,
      value INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS catalog_refresh_jobs (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      provider TEXT NOT NULL,
      total INTEGER NOT NULL DEFAULT 0,
      done INTEGER NOT NULL DEFAULT 0,
      failed INTEGER NOT NULL DEFAULT 0,
      message TEXT,
      started_at TEXT NOT NULL,
      finished_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_trend_runs_query ON trend_runs(query, country, timeframe);
    CREATE INDEX IF NOT EXISTS idx_trend_points_run ON trend_points(run_id);
    CREATE INDEX IF NOT EXISTS idx_trend_related_run ON trend_related(run_id);

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT,
      locale TEXT NOT NULL DEFAULT 'ru',
      role TEXT NOT NULL DEFAULT 'user',
      plan TEXT NOT NULL DEFAULT 'free',
      status TEXT NOT NULL DEFAULT 'active',
      email_verified_at TEXT,
      stripe_customer_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      plan_id TEXT NOT NULL DEFAULT 'pro',
      status TEXT NOT NULL DEFAULT 'inactive',
      stripe_subscription_id TEXT,
      stripe_customer_id TEXT,
      current_period_end TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS user_api_keys (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      provider TEXT NOT NULL,
      ciphertext TEXT NOT NULL,
      iv TEXT NOT NULL,
      hint TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_user_api_keys_user_provider
      ON user_api_keys(user_id, provider);
    CREATE TABLE IF NOT EXISTS usage_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      units INTEGER NOT NULL DEFAULT 1,
      day TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_usage_user_day ON usage_events(user_id, day, action);
    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price_cents INTEGER NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'usd',
      daily_research_cap INTEGER NOT NULL DEFAULT 20,
      daily_xml_cap INTEGER NOT NULL DEFAULT 3,
      allow_paid_keys INTEGER NOT NULL DEFAULT 0,
      stripe_price_id TEXT NOT NULL DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS admin_audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_id TEXT NOT NULL,
      action TEXT NOT NULL,
      payload TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL
    );
  `);

  // Additive columns for older DBs
  tryAddColumn(sqlite, "trend_runs", "user_id", "TEXT");
  tryAddColumn(sqlite, "opportunities", "user_id", "TEXT");
}

function tryAddColumn(
  sqlite: { exec: (sql: string) => unknown },
  table: string,
  column: string,
  type: string
) {
  try {
    sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  } catch {
    // already exists
  }
}
