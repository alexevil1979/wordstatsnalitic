import { db } from "@/db";
import { countries, niches, opportunities } from "@/db/schema";
import { computeOpportunityScore } from "@/lib/scoring";
import type {
  Competition,
  IntentLevel,
  KeywordOpportunity,
  NicheCategory,
  OpportunityFilters,
  Recommendation,
  Trend,
  EntryDifficulty,
  DashboardStats,
  Insight,
} from "@/lib/types";
import { and, asc, eq, like, type SQL } from "drizzle-orm";
import { nanoid } from "nanoid";
import { insights as insightsTable } from "@/db/schema";

function mapRow(r: {
  id: string;
  countryCode: string;
  nicheId: string;
  queryCluster: string;
  searchVolume: number;
  trend: string;
  competition: string;
  commercialIntent: string;
  marginPotential: string;
  entryDifficulty: string;
  recommendation: string;
  exampleOffer: string;
  exampleOfferRu: string;
  priceRange: string;
  source: string;
  confidence: number;
  updatedAt: string;
  countryNameRu?: string | null;
  countryNameEn?: string | null;
  nicheNameRu?: string | null;
  nicheNameEn?: string | null;
  nicheCategory?: string | null;
}): KeywordOpportunity {
  const base: KeywordOpportunity = {
    id: r.id,
    countryCode: r.countryCode,
    nicheId: r.nicheId,
    queryCluster: r.queryCluster,
    searchVolume: r.searchVolume,
    trend: r.trend as Trend,
    competition: r.competition as Competition,
    commercialIntent: r.commercialIntent as IntentLevel,
    marginPotential: r.marginPotential as IntentLevel,
    entryDifficulty: r.entryDifficulty as EntryDifficulty,
    recommendation: r.recommendation as Recommendation,
    exampleOffer: r.exampleOffer,
    exampleOfferRu: r.exampleOfferRu,
    priceRange: r.priceRange,
    source: r.source,
    confidence: r.confidence,
    updatedAt: r.updatedAt,
    countryNameRu: r.countryNameRu ?? undefined,
    countryNameEn: r.countryNameEn ?? undefined,
    nicheNameRu: r.nicheNameRu ?? undefined,
    nicheNameEn: r.nicheNameEn ?? undefined,
    nicheCategory: (r.nicheCategory as NicheCategory) ?? undefined,
  };
  return { ...base, opportunityScore: computeOpportunityScore(base) };
}

function buildWhere(filters: OpportunityFilters): SQL | undefined {
  const parts: SQL[] = [];
  if (filters.country) parts.push(eq(opportunities.countryCode, filters.country));
  if (filters.niche) parts.push(eq(opportunities.nicheId, filters.niche));
  if (filters.competition)
    parts.push(eq(opportunities.competition, filters.competition));
  if (filters.margin) parts.push(eq(opportunities.marginPotential, filters.margin));
  if (filters.recommendation)
    parts.push(eq(opportunities.recommendation, filters.recommendation));
  if (filters.category) parts.push(eq(niches.category, filters.category));
  if (filters.q) parts.push(like(opportunities.queryCluster, `%${filters.q}%`));
  if (parts.length === 0) return undefined;
  if (parts.length === 1) return parts[0];
  return and(...parts);
}

export function listOpportunities(filters: OpportunityFilters = {}): KeywordOpportunity[] {
  const where = buildWhere(filters);
  const rows = db
    .select({
      id: opportunities.id,
      countryCode: opportunities.countryCode,
      nicheId: opportunities.nicheId,
      queryCluster: opportunities.queryCluster,
      searchVolume: opportunities.searchVolume,
      trend: opportunities.trend,
      competition: opportunities.competition,
      commercialIntent: opportunities.commercialIntent,
      marginPotential: opportunities.marginPotential,
      entryDifficulty: opportunities.entryDifficulty,
      recommendation: opportunities.recommendation,
      exampleOffer: opportunities.exampleOffer,
      exampleOfferRu: opportunities.exampleOfferRu,
      priceRange: opportunities.priceRange,
      source: opportunities.source,
      confidence: opportunities.confidence,
      updatedAt: opportunities.updatedAt,
      countryNameRu: countries.nameRu,
      countryNameEn: countries.nameEn,
      nicheNameRu: niches.nameRu,
      nicheNameEn: niches.nameEn,
      nicheCategory: niches.category,
    })
    .from(opportunities)
    .innerJoin(countries, eq(opportunities.countryCode, countries.code))
    .innerJoin(niches, eq(opportunities.nicheId, niches.id))
    .where(where)
    .all();

  const mapped = rows.map(mapRow);

  const sort = filters.sort ?? "opportunityScore";
  const order = filters.order ?? "desc";
  mapped.sort((a, b) => {
    const av = (a as unknown as Record<string, unknown>)[sort];
    const bv = (b as unknown as Record<string, unknown>)[sort];
    if (typeof av === "number" && typeof bv === "number") {
      return order === "asc" ? av - bv : bv - av;
    }
    return order === "asc"
      ? String(av ?? "").localeCompare(String(bv ?? ""))
      : String(bv ?? "").localeCompare(String(av ?? ""));
  });

  return mapped;
}

export function getOpportunity(id: string): KeywordOpportunity | null {
  const rows = listOpportunities();
  return rows.find((r) => r.id === id) ?? null;
}

export type OpportunityInput = {
  countryCode: string;
  nicheId: string;
  queryCluster: string;
  searchVolume: number;
  trend: Trend;
  competition: Competition;
  commercialIntent: IntentLevel;
  marginPotential: IntentLevel;
  entryDifficulty: EntryDifficulty;
  recommendation: Recommendation;
  exampleOffer: string;
  exampleOfferRu: string;
  priceRange: string;
  source?: string;
  confidence?: number;
};

export function createOpportunity(input: OpportunityInput): KeywordOpportunity {
  const id = nanoid(10);
  const updatedAt = new Date().toISOString();
  db.insert(opportunities)
    .values({
      id,
      countryCode: input.countryCode,
      nicheId: input.nicheId,
      queryCluster: input.queryCluster,
      searchVolume: input.searchVolume,
      trend: input.trend,
      competition: input.competition,
      commercialIntent: input.commercialIntent,
      marginPotential: input.marginPotential,
      entryDifficulty: input.entryDifficulty,
      recommendation: input.recommendation,
      exampleOffer: input.exampleOffer,
      exampleOfferRu: input.exampleOfferRu,
      priceRange: input.priceRange,
      source: input.source ?? "expert_estimate",
      confidence: input.confidence ?? 0.7,
      updatedAt,
    })
    .run();
  return getOpportunity(id)!;
}

export function updateOpportunity(
  id: string,
  input: Partial<OpportunityInput>
): KeywordOpportunity | null {
  const existing = db
    .select()
    .from(opportunities)
    .where(eq(opportunities.id, id))
    .get();
  if (!existing) return null;

  db.update(opportunities)
    .set({
      countryCode: input.countryCode ?? existing.countryCode,
      nicheId: input.nicheId ?? existing.nicheId,
      queryCluster: input.queryCluster ?? existing.queryCluster,
      searchVolume: input.searchVolume ?? existing.searchVolume,
      trend: input.trend ?? existing.trend,
      competition: input.competition ?? existing.competition,
      commercialIntent: input.commercialIntent ?? existing.commercialIntent,
      marginPotential: input.marginPotential ?? existing.marginPotential,
      entryDifficulty: input.entryDifficulty ?? existing.entryDifficulty,
      recommendation: input.recommendation ?? existing.recommendation,
      exampleOffer: input.exampleOffer ?? existing.exampleOffer,
      exampleOfferRu: input.exampleOfferRu ?? existing.exampleOfferRu,
      priceRange: input.priceRange ?? existing.priceRange,
      source: input.source ?? existing.source,
      confidence: input.confidence ?? existing.confidence,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(opportunities.id, id))
    .run();

  return getOpportunity(id);
}

export function deleteOpportunity(id: string): boolean {
  const result = db.delete(opportunities).where(eq(opportunities.id, id)).run();
  return result.changes > 0;
}

export function listCountries() {
  return db.select().from(countries).orderBy(asc(countries.nameEn)).all();
}

export function listNiches() {
  return db.select().from(niches).orderBy(asc(niches.nameEn)).all();
}

export function listInsights(): Insight[] {
  return db
    .select()
    .from(insightsTable)
    .orderBy(asc(insightsTable.rank))
    .all()
    .map((i) => ({
      id: i.id,
      rank: i.rank,
      titleRu: i.titleRu,
      titleEn: i.titleEn,
      bodyRu: i.bodyRu,
      bodyEn: i.bodyEn,
      nicheIds: JSON.parse(i.nicheIds) as string[],
      countryCodes: JSON.parse(i.countryCodes) as string[],
    }));
}

export function getDashboardStats(): DashboardStats {
  const all = listOpportunities();
  const launchReady = all.filter((o) => o.recommendation === "launch").length;
  const avgScore =
    all.length === 0
      ? 0
      : Math.round(
          all.reduce((s, o) => s + (o.opportunityScore ?? 0), 0) / all.length
        );
  const growingShare =
    all.length === 0
      ? 0
      : Math.round((all.filter((o) => o.trend === "growing").length / all.length) * 100);

  const byCountry = new Map<string, KeywordOpportunity[]>();
  for (const o of all) {
    const arr = byCountry.get(o.countryCode) ?? [];
    arr.push(o);
    byCountry.set(o.countryCode, arr);
  }

  const topByCountry = Array.from(byCountry.entries())
    .map(([code, rows]) => {
      const nicheScores = new Map<string, { sum: number; count: number; ru: string; en: string }>();
      for (const r of rows) {
        const cur = nicheScores.get(r.nicheId) ?? {
          sum: 0,
          count: 0,
          ru: r.nicheNameRu ?? r.nicheId,
          en: r.nicheNameEn ?? r.nicheId,
        };
        cur.sum += r.opportunityScore ?? 0;
        cur.count += 1;
        nicheScores.set(r.nicheId, cur);
      }
      let topNicheId = "";
      let topAvg = -1;
      let topRu = "";
      let topEn = "";
      for (const [nid, v] of nicheScores) {
        const avg = v.sum / v.count;
        if (avg > topAvg) {
          topAvg = avg;
          topNicheId = nid;
          topRu = v.ru;
          topEn = v.en;
        }
      }
      const countryAvg = Math.round(
        rows.reduce((s, r) => s + (r.opportunityScore ?? 0), 0) / rows.length
      );
      return {
        countryCode: code,
        countryNameRu: rows[0]?.countryNameRu ?? code,
        countryNameEn: rows[0]?.countryNameEn ?? code,
        topNicheId,
        topNicheRu: topRu,
        topNicheEn: topEn,
        avgScore: countryAvg,
        launchCount: rows.filter((r) => r.recommendation === "launch").length,
      };
    })
    .sort((a, b) => b.avgScore - a.avgScore);

  const topMarginLowCompetition = all
    .filter(
      (o) =>
        o.marginPotential === "high" &&
        (o.competition === "low" || o.competition === "medium")
    )
    .sort((a, b) => (b.opportunityScore ?? 0) - (a.opportunityScore ?? 0))
    .slice(0, 8);

  const topScores = [...all]
    .sort((a, b) => (b.opportunityScore ?? 0) - (a.opportunityScore ?? 0))
    .slice(0, 8);

  return {
    totalOpportunities: all.length,
    launchReady,
    avgScore,
    growingShare,
    topByCountry,
    topMarginLowCompetition,
    topScores,
  };
}
