import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { opportunities } from "@/db/schema";
import type { ResearchResponse } from "./types";

export function upsertOpportunityFromTrends(params: {
  research: ResearchResponse;
  nicheId: string;
  exampleOffer?: string;
  exampleOfferRu?: string;
  priceRange?: string;
}): { id: string; created: boolean } {
  const { research, nicheId } = params;
  const insight = research.insight;
  const queryCluster = research.query;
  const countryCode = research.country.toUpperCase();

  const existing = db
    .select()
    .from(opportunities)
    .where(
      and(
        eq(opportunities.countryCode, countryCode),
        eq(opportunities.queryCluster, queryCluster)
      )
    )
    .get();

  const competition =
    insight.risingCount >= 8 ? "high" : insight.risingCount >= 3 ? "medium" : "low";
  const commercialIntent = insight.commercialHits >= 2 ? "high" : "medium";
  const marginPotential = insight.recommendation === "launch" ? "high" : "medium";
  const entryDifficulty =
    insight.recommendation === "launch" && competition === "low" ? "low" : "medium";

  const offerEn =
    params.exampleOffer ??
    (insight.offerIdeas[0]
      ? `Offer around: ${insight.offerIdeas[0]}`
      : `Service/product for “${queryCluster}”`);
  const offerRu =
    params.exampleOfferRu ??
    (insight.offerIdeas[0]
      ? `Оффер вокруг: ${insight.offerIdeas[0]}`
      : `Услуга/продукт по запросу «${queryCluster}»`);

  const updatedAt = new Date().toISOString();
  const values = {
    countryCode,
    nicheId,
    queryCluster,
    searchVolume: insight.volumeProxy,
    trend: insight.trendDirection,
    competition,
    commercialIntent,
    marginPotential,
    entryDifficulty,
    recommendation: insight.recommendation,
    exampleOffer: offerEn,
    exampleOfferRu: offerRu,
    priceRange: params.priceRange ?? "See market / validate",
    source: research.provider === "serpapi" ? "serpapi" : "google_trends",
    confidence: research.provider === "serpapi" ? 0.7 : 0.55,
    updatedAt,
  };

  if (existing) {
    db.update(opportunities).set(values).where(eq(opportunities.id, existing.id)).run();
    return { id: existing.id, created: false };
  }

  const id = nanoid(10);
  db.insert(opportunities).values({ id, ...values }).run();
  return { id, created: true };
}
