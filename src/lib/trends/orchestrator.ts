import { and, desc, eq, gt } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { trendPoints, trendRelated, trendRuns } from "@/db/schema";
import { getKeywordProvider } from "@/lib/providers";
import type { TrendResearchResult } from "@/lib/providers/types";
import { getSetting } from "@/lib/settings";
import { analyzeTrends, computeTrendsScore } from "./analyze";
import type { ResearchResponse, TrendInsight } from "./types";

export type { ResearchResponse } from "./types";

function loadCachedRun(runId: string): TrendResearchResult | null {
  const run = db.select().from(trendRuns).where(eq(trendRuns.id, runId)).get();
  if (!run || run.status !== "ok") return null;
  const points = db
    .select()
    .from(trendPoints)
    .where(eq(trendPoints.runId, runId))
    .all()
    .map((p) => ({ date: p.date, interest: p.interest }));
  const related = db.select().from(trendRelated).where(eq(trendRelated.runId, runId)).all();
  return {
    provider: run.provider,
    query: run.query,
    country: run.country,
    timeframe: run.timeframe,
    points,
    relatedTop: related
      .filter((r) => r.type === "top")
      .map((r) => ({ query: r.query, value: r.value })),
    relatedRising: related
      .filter((r) => r.type === "rising")
      .map((r) => ({ query: r.query, value: r.value })),
    regions: [],
    runId,
    cached: true,
  };
}

function findFreshCache(query: string, country: string, timeframe: string): string | null {
  const ttlHours = Number(getSetting("TRENDS_CACHE_TTL_HOURS", "24")) || 24;
  const since = new Date(Date.now() - ttlHours * 3600_000).toISOString();
  const row = db
    .select()
    .from(trendRuns)
    .where(
      and(
        eq(trendRuns.query, query),
        eq(trendRuns.country, country),
        eq(trendRuns.timeframe, timeframe),
        eq(trendRuns.status, "ok"),
        gt(trendRuns.createdAt, since)
      )
    )
    .orderBy(desc(trendRuns.createdAt))
    .get();
  return row?.id ?? null;
}

function persistRun(
  result: TrendResearchResult,
  insight: TrendInsight,
  status: "ok" | "error",
  error?: string
): string {
  const id = nanoid(12);
  const createdAt = new Date().toISOString();
  db.insert(trendRuns)
    .values({
      id,
      query: result.query,
      country: result.country,
      provider: result.provider,
      timeframe: result.timeframe,
      status,
      error: error ?? null,
      avgInterest: insight.avgInterest,
      peakInterest: insight.peakInterest,
      trendDirection: insight.trendDirection,
      insightJson: JSON.stringify(insight),
      createdAt,
    })
    .run();

  if (status === "ok") {
    const insertPoint = db.insert(trendPoints);
    for (const p of result.points) {
      insertPoint.values({ runId: id, date: p.date, interest: p.interest }).run();
    }
    for (const r of result.relatedTop) {
      db.insert(trendRelated)
        .values({ runId: id, type: "top", query: r.query, value: r.value })
        .run();
    }
    for (const r of result.relatedRising) {
      db.insert(trendRelated)
        .values({ runId: id, type: "rising", query: r.query, value: r.value })
        .run();
    }
  }
  return id;
}

export async function researchTrends(params: {
  query: string;
  country: string;
  timeframe?: string;
  force?: boolean;
}): Promise<ResearchResponse> {
  const query = params.query.trim();
  const country = params.country.toUpperCase();
  const timeframe = params.timeframe ?? "today 12-m";

  if (!params.force) {
    const cachedId = findFreshCache(query, country, timeframe);
    if (cachedId) {
      const cached = loadCachedRun(cachedId);
      if (cached) {
        const insight = analyzeTrends(cached);
        return {
          ...cached,
          insight,
          score: computeTrendsScore(insight),
          runId: cachedId,
          cached: true,
        };
      }
    }
  }

  const provider = getKeywordProvider();
  if (!provider.research) {
    throw new Error(`Provider ${provider.name} does not support research()`);
  }

  try {
    const result = await provider.research({ query, country, timeframe });
    const insight = analyzeTrends(result);
    const runId = persistRun(result, insight, "ok");
    return {
      ...result,
      insight,
      score: computeTrendsScore(insight),
      runId,
      cached: false,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const empty: TrendResearchResult = {
      provider: provider.name,
      query,
      country,
      timeframe,
      points: [],
      relatedTop: [],
      relatedRising: [],
    };
    const insight = analyzeTrends(empty);
    persistRun(empty, insight, "error", message);
    throw e;
  }
}
