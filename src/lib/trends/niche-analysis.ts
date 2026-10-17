import { analyzeTrends, computeTrendsScore } from "./analyze";
import { researchTrends } from "./orchestrator";
import { upsertOpportunityFromTrends } from "./map-to-opportunity";
import { queriesForNiche } from "./watchlist";
import type { ResearchResponse } from "./types";
import type { RelatedQuery } from "@/lib/providers/types";

export type NicheQueryResult = {
  query: string;
  ok: boolean;
  error?: string;
  research?: ResearchResponse;
};

export type NicheAnalysis = {
  nicheId: string;
  country: string;
  timeframe: string;
  queries: NicheQueryResult[];
  aggregate: {
    avgInterest: number;
    peakInterest: number;
    score: number;
    risingQueries: RelatedQuery[];
    topQueries: RelatedQuery[];
    seedQueriesRanked: Array<{
      query: string;
      avgInterest: number;
      score: number;
      recommendation: string;
      trendDirection: string;
    }>;
    summaryRu: string;
    summaryEn: string;
  };
};

function mergeRelated(
  lists: RelatedQuery[][],
  limit: number
): RelatedQuery[] {
  const map = new Map<string, number>();
  for (const list of lists) {
    for (const r of list) {
      const key = r.query.toLowerCase();
      map.set(key, Math.max(map.get(key) ?? 0, r.value));
    }
  }
  return Array.from(map.entries())
    .map(([query, value]) => ({ query, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function analyzeNiche(params: {
  nicheId: string;
  country: string;
  timeframe?: string;
  force?: boolean;
  upsertCatalog?: boolean;
  queryLimit?: number;
  delayMs?: number;
}): Promise<NicheAnalysis> {
  const country = params.country.toUpperCase();
  const timeframe = params.timeframe ?? "today 12-m";
  const seeds = queriesForNiche(params.nicheId, params.queryLimit ?? 5);
  if (seeds.length === 0) {
    throw new Error(`No watchlist queries for niche: ${params.nicheId}`);
  }

  const queries: NicheQueryResult[] = [];
  for (let i = 0; i < seeds.length; i++) {
    const query = seeds[i];
    try {
      const research = await researchTrends({
        query,
        country,
        timeframe,
        force: params.force,
      });
      queries.push({ query, ok: true, research });
      if (params.upsertCatalog) {
        upsertOpportunityFromTrends({
          research,
          nicheId: params.nicheId,
        });
      }
    } catch (e) {
      queries.push({
        query,
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      });
    }
    if (i < seeds.length - 1) {
      await sleep(params.delayMs ?? 3500);
    }
  }

  const ok = queries.filter((q) => q.ok && q.research) as Array<
    NicheQueryResult & { research: ResearchResponse }
  >;

  const avgInterest =
    ok.length === 0
      ? 0
      : Math.round(
          (ok.reduce((s, q) => s + q.research.insight.avgInterest, 0) / ok.length) *
            10
        ) / 10;
  const peakInterest =
    ok.length === 0
      ? 0
      : Math.max(...ok.map((q) => q.research.insight.peakInterest));

  const risingQueries = mergeRelated(
    ok.map((q) => q.research.relatedRising),
    20
  );
  const topQueries = mergeRelated(
    ok.map((q) => q.research.relatedTop),
    20
  );

  const seedQueriesRanked = ok
    .map((q) => ({
      query: q.query,
      avgInterest: q.research.insight.avgInterest,
      score: q.research.score,
      recommendation: q.research.insight.recommendation,
      trendDirection: q.research.insight.trendDirection,
    }))
    .sort((a, b) => b.score - a.score);

  const synthetic = {
    provider: "google_trends",
    query: params.nicheId,
    country,
    timeframe,
    points: [],
    relatedTop: topQueries,
    relatedRising: risingQueries,
  };
  const bucketInsight = analyzeTrends({
    ...synthetic,
    points: ok.flatMap((q) => q.research.points).slice(-30),
  });
  // override avg/peak with niche-level means
  bucketInsight.avgInterest = avgInterest;
  bucketInsight.peakInterest = peakInterest;
  const score = computeTrendsScore(bucketInsight);

  const failed = queries.length - ok.length;
  const summaryRu = `Ниша проанализирована по ${ok.length} поисковым кластерам (страна ${country}). Средний интерес Google Trends: ${avgInterest}/100, пик ${peakInterest}. Найдено ${risingQueries.length} rising-запросов — это то, что люди сейчас активно ищут рядом с нишей. Неудачных запросов: ${failed}. Данные относительные (не абсолютный volume).`;
  const summaryEn = `Niche analyzed across ${ok.length} search clusters (country ${country}). Avg Google Trends interest: ${avgInterest}/100, peak ${peakInterest}. Found ${risingQueries.length} rising related queries — what people are actively searching near this niche. Failed queries: ${failed}. Interest is relative, not absolute volume.`;

  return {
    nicheId: params.nicheId,
    country,
    timeframe,
    queries,
    aggregate: {
      avgInterest,
      peakInterest,
      score,
      risingQueries,
      topQueries,
      seedQueriesRanked,
      summaryRu,
      summaryEn,
    },
  };
}
