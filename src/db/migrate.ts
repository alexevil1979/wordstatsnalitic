/** Idempotent DDL for Trends + settings tables (keeps existing seed data). */
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
      created_at TEXT NOT NULL
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
  `);
}
