import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { catalogRefreshJobs, niches, trendRelated, trendRuns } from "@/db/schema";
import { listOpportunities } from "@/lib/repositories/opportunities";
import type { KeywordOpportunity } from "@/lib/types";
import type { MarketOverview, NicheCountryCell } from "./overview-types";

export type { MarketOverview, NicheCountryCell } from "./overview-types";

const MAJOR_COUNTRIES = ["US", "GB", "DE", "CA", "AU", "AE", "SA", "RU", "NL", "SG"];


export function getMarketOverview(): MarketOverview {
  const all = listOpportunities();
  const major = all.filter((o) => MAJOR_COUNTRIES.includes(o.countryCode));
  const trendsRows = major.filter(
    (o) => o.source === "google_trends" || o.source === "serpapi"
  );

  const nicheMeta = db.select().from(niches).all();
  const nicheMap = new Map(nicheMeta.map((n) => [n.id, n]));

  // matrix niche × country
  const bucket = new Map<string, KeywordOpportunity[]>();
  for (const o of major) {
    const key = `${o.nicheId}::${o.countryCode}`;
    const arr = bucket.get(key) ?? [];
    arr.push(o);
    bucket.set(key, arr);
  }

  const matrix: NicheCountryCell[] = [];
  for (const [key, rows] of bucket) {
    const [nicheId, countryCode] = key.split("::");
    const meta = nicheMap.get(nicheId);
    const avgScore = Math.round(
      rows.reduce((s, r) => s + (r.opportunityScore ?? 0), 0) / rows.length
    );
    const avgVolume = Math.round(
      rows.reduce((s, r) => s + r.searchVolume, 0) / rows.length
    );
    const top = [...rows].sort(
      (a, b) => (b.opportunityScore ?? 0) - (a.opportunityScore ?? 0)
    )[0];
    matrix.push({
      nicheId,
      nicheNameRu: meta?.nameRu ?? nicheId,
      nicheNameEn: meta?.nameEn ?? nicheId,
      category: meta?.category ?? "",
      countryCode,
      avgScore,
      avgVolume,
      launchCount: rows.filter((r) => r.recommendation === "launch").length,
      growingCount: rows.filter((r) => r.trend === "growing").length,
      rowCount: rows.length,
      topQuery: top?.queryCluster ?? "",
      sourceMix: [...new Set(rows.map((r) => r.source))],
    });
  }
  matrix.sort((a, b) => b.avgScore - a.avgScore);

  // by niche
  const byNicheMap = new Map<string, KeywordOpportunity[]>();
  for (const o of major) {
    const arr = byNicheMap.get(o.nicheId) ?? [];
    arr.push(o);
    byNicheMap.set(o.nicheId, arr);
  }
  const byNiche = Array.from(byNicheMap.entries())
    .map(([nicheId, rows]) => {
      const meta = nicheMap.get(nicheId);
      return {
        nicheId,
        nicheNameRu: meta?.nameRu ?? nicheId,
        nicheNameEn: meta?.nameEn ?? nicheId,
        category: meta?.category ?? "",
        avgScore: Math.round(
          rows.reduce((s, r) => s + (r.opportunityScore ?? 0), 0) / rows.length
        ),
        countriesCovered: new Set(rows.map((r) => r.countryCode)).size,
        launchCount: rows.filter((r) => r.recommendation === "launch").length,
      };
    })
    .sort((a, b) => b.avgScore - a.avgScore);

  // by country
  const byCountryMap = new Map<string, KeywordOpportunity[]>();
  for (const o of major) {
    const arr = byCountryMap.get(o.countryCode) ?? [];
    arr.push(o);
    byCountryMap.set(o.countryCode, arr);
  }
  const byCountry = Array.from(byCountryMap.entries())
    .map(([countryCode, rows]) => {
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
      let topRu = "";
      let topEn = "";
      let topAvg = -1;
      for (const v of nicheScores.values()) {
        const avg = v.sum / v.count;
        if (avg > topAvg) {
          topAvg = avg;
          topRu = v.ru;
          topEn = v.en;
        }
      }
      return {
        countryCode,
        countryNameRu: rows[0]?.countryNameRu ?? countryCode,
        countryNameEn: rows[0]?.countryNameEn ?? countryCode,
        avgScore: Math.round(
          rows.reduce((s, r) => s + (r.opportunityScore ?? 0), 0) / rows.length
        ),
        launchCount: rows.filter((r) => r.recommendation === "launch").length,
        topNicheRu: topRu,
        topNicheEn: topEn,
      };
    })
    .sort((a, b) => b.avgScore - a.avgScore);

  const topLaunch = major
    .filter((o) => o.recommendation === "launch")
    .sort((a, b) => (b.opportunityScore ?? 0) - (a.opportunityScore ?? 0))
    .slice(0, 15);

  const topGrowing = major
    .filter((o) => o.trend === "growing")
    .sort((a, b) => (b.opportunityScore ?? 0) - (a.opportunityScore ?? 0))
    .slice(0, 15);

  // rising from recent trend runs
  const recentRuns = db
    .select()
    .from(trendRuns)
    .where(eq(trendRuns.status, "ok"))
    .orderBy(desc(trendRuns.createdAt))
    .limit(40)
    .all();
  const runIds = recentRuns.map((r) => r.id);
  const runCountry = new Map(recentRuns.map((r) => [r.id, r.country]));
  const risingQueries: Array<{ query: string; value: number; country: string }> = [];
  if (runIds.length > 0) {
    const related = db
      .select()
      .from(trendRelated)
      .where(inArray(trendRelated.runId, runIds))
      .all()
      .filter((r) => r.type === "rising");
    const map = new Map<string, { value: number; country: string }>();
    for (const r of related) {
      const key = r.query.toLowerCase();
      const country = runCountry.get(r.runId) ?? "";
      const prev = map.get(key);
      if (!prev || r.value > prev.value) {
        map.set(key, { value: r.value, country });
      }
    }
    risingQueries.push(
      ...Array.from(map.entries())
        .map(([query, v]) => ({ query, value: v.value, country: v.country }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 25)
    );
  }

  const lastJob = db
    .select()
    .from(catalogRefreshJobs)
    .orderBy(desc(catalogRefreshJobs.startedAt))
    .get();

  return {
    majorCountries: MAJOR_COUNTRIES,
    lastRefresh: lastJob
      ? {
          id: lastJob.id,
          status: lastJob.status,
          done: lastJob.done,
          failed: lastJob.failed,
          total: lastJob.total,
          finishedAt: lastJob.finishedAt,
          startedAt: lastJob.startedAt,
        }
      : null,
    matrix,
    topLaunch,
    topGrowing,
    risingQueries,
    byNiche,
    byCountry,
    totals: {
      opportunities: major.length,
      trendsRows: trendsRows.length,
      niches: byNiche.length,
      countries: byCountry.length,
    },
  };
}
