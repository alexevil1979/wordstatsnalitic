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
