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
  userId: text("user_id"),
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
  userId: text("user_id"),
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

/** SaaS: users */
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  locale: text("locale").notNull().default("ru"),
  role: text("role").notNull().default("user"), // user | admin
  plan: text("plan").notNull().default("free"), // free | pro
  status: text("status").notNull().default("active"), // active | disabled
  emailVerifiedAt: text("email_verified_at"),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  planId: text("plan_id").notNull().default("pro"),
  status: text("status").notNull().default("inactive"), // active | past_due | canceled | inactive
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeCustomerId: text("stripe_customer_id"),
  currentPeriodEnd: text("current_period_end"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const userApiKeys = sqliteTable("user_api_keys", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  provider: text("provider").notNull(), // serpapi | dataforseo_login | dataforseo_password | ahrefs
  ciphertext: text("ciphertext").notNull(),
  iv: text("iv").notNull(),
  hint: text("hint").notNull().default(""),
  updatedAt: text("updated_at").notNull(),
});

export const usageEvents = sqliteTable("usage_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  action: text("action").notNull(),
  units: integer("units").notNull().default(1),
  day: text("day").notNull(), // YYYY-MM-DD
  createdAt: text("created_at").notNull(),
});

export const plans = sqliteTable("plans", {
  id: text("id").primaryKey(), // free | pro
  name: text("name").notNull(),
  priceCents: integer("price_cents").notNull().default(0),
  currency: text("currency").notNull().default("usd"),
  dailyResearchCap: integer("daily_research_cap").notNull().default(20),
  dailyXmlCap: integer("daily_xml_cap").notNull().default(3),
  allowPaidKeys: integer("allow_paid_keys").notNull().default(0),
  stripePriceId: text("stripe_price_id").notNull().default(""),
  active: integer("active").notNull().default(1),
  updatedAt: text("updated_at").notNull(),
});

export const adminAuditLog = sqliteTable("admin_audit_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  actorId: text("actor_id").notNull(),
  action: text("action").notNull(),
  payload: text("payload").notNull().default("{}"),
  createdAt: text("created_at").notNull(),
});
