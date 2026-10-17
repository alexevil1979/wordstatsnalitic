import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const countries = sqliteTable("countries", {
  code: text("code").primaryKey(),
  nameRu: text("name_ru").notNull(),
  nameEn: text("name_en").notNull(),
  region: text("region").notNull(),
  currency: text("currency").notNull(),
});

export const niches = sqliteTable("niches", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  nameRu: text("name_ru").notNull(),
  nameEn: text("name_en").notNull(),
});

export const opportunities = sqliteTable("opportunities", {
  id: text("id").primaryKey(),
  countryCode: text("country_code")
    .notNull()
    .references(() => countries.code),
  nicheId: text("niche_id")
    .notNull()
    .references(() => niches.id),
  queryCluster: text("query_cluster").notNull(),
  searchVolume: integer("search_volume").notNull(),
  trend: text("trend").notNull(),
  competition: text("competition").notNull(),
  commercialIntent: text("commercial_intent").notNull(),
  marginPotential: text("margin_potential").notNull(),
  entryDifficulty: text("entry_difficulty").notNull(),
  recommendation: text("recommendation").notNull(),
  exampleOffer: text("example_offer").notNull(),
  exampleOfferRu: text("example_offer_ru").notNull(),
  priceRange: text("price_range").notNull(),
  source: text("source").notNull().default("expert_estimate"),
  confidence: real("confidence").notNull().default(0.7),
  updatedAt: text("updated_at").notNull(),
});

export const insights = sqliteTable("insights", {
  id: text("id").primaryKey(),
  rank: integer("rank").notNull(),
  titleRu: text("title_ru").notNull(),
  titleEn: text("title_en").notNull(),
  bodyRu: text("body_ru").notNull(),
  bodyEn: text("body_en").notNull(),
  nicheIds: text("niche_ids").notNull(),
  countryCodes: text("country_codes").notNull(),
});

export const appSettings = sqliteTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
  updatedAt: text("updated_at").notNull(),
});

export const trendRuns = sqliteTable("trend_runs", {
  id: text("id").primaryKey(),
  query: text("query").notNull(),
  country: text("country").notNull(),
  provider: text("provider").notNull(),
  timeframe: text("timeframe").notNull(),
  status: text("status").notNull(),
  error: text("error"),
  avgInterest: real("avg_interest"),
  peakInterest: real("peak_interest"),
  trendDirection: text("trend_direction"),
  insightJson: text("insight_json"),
  createdAt: text("created_at").notNull(),
});

export const trendPoints = sqliteTable("trend_points", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  runId: text("run_id")
    .notNull()
    .references(() => trendRuns.id),
  date: text("date").notNull(),
  interest: integer("interest").notNull(),
});

export const trendRelated = sqliteTable("trend_related", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  runId: text("run_id")
    .notNull()
    .references(() => trendRuns.id),
  type: text("type").notNull(),
  query: text("query").notNull(),
  value: integer("value").notNull().default(0),
});

export const catalogRefreshJobs = sqliteTable("catalog_refresh_jobs", {
  id: text("id").primaryKey(),
  status: text("status").notNull(),
  provider: text("provider").notNull(),
  total: integer("total").notNull().default(0),
  done: integer("done").notNull().default(0),
  failed: integer("failed").notNull().default(0),
  message: text("message"),
  startedAt: text("started_at").notNull(),
  finishedAt: text("finished_at"),
});
