import type { Recommendation, Trend } from "@/lib/types";
import type { RelatedQuery, TrendPoint, TrendResearchResult } from "@/lib/providers/types";
import type { TrendInsight } from "./types";

export type { TrendInsight } from "./types";

const COMMERCIAL = [
  "hire",
  "agency",
  "freelance",
  "service",
  "buy",
  "price",
  "cost",
  "course",
  "template",
  "software",
  "tool",
  "saas",
  "consultant",
  "near me",
  "best",
  "купить",
  "заказать",
  "агентство",
  "фриланс",
  "курс",
  "цена",
];

function slopeDirection(points: TrendPoint[]): Trend {
  if (points.length < 4) return "stable";
  const third = Math.max(1, Math.floor(points.length / 3));
  const first = points.slice(0, third);
  const last = points.slice(-third);
  const avg = (arr: TrendPoint[]) =>
    arr.reduce((s, p) => s + p.interest, 0) / Math.max(1, arr.length);
  const a = avg(first);
  const b = avg(last);
  if (b > a * 1.15 + 3) return "growing";
  if (b < a * 0.85 - 3) return "declining";
  return "stable";
}

function countCommercial(related: RelatedQuery[]): number {
  let n = 0;
  for (const r of related) {
    const q = r.query.toLowerCase();
    if (COMMERCIAL.some((m) => q.includes(m))) n += 1;
  }
  return n;
}

export function analyzeTrends(result: TrendResearchResult): TrendInsight {
  const points = result.points;
  const avgInterest =
    points.length === 0
      ? 0
      : Math.round((points.reduce((s, p) => s + p.interest, 0) / points.length) * 10) / 10;
  const peakInterest = points.reduce((m, p) => Math.max(m, p.interest), 0);
  const trendDirection = slopeDirection(points);
  const risingCount = result.relatedRising.length;
  const commercialHits = countCommercial([
    ...result.relatedTop,
    ...result.relatedRising,
  ]);

  const volumeProxy = Math.round(avgInterest * 100);

  let recommendation: Recommendation = "test";
  if (avgInterest >= 40 && trendDirection === "growing" && risingCount >= 3) {
    recommendation = "launch";
  } else if (avgInterest < 15 || trendDirection === "declining") {
    recommendation = "not_now";
  } else if (commercialHits >= 2 && avgInterest >= 25) {
    recommendation = "launch";
  }

  const offerIdeas = result.relatedRising
    .slice(0, 5)
    .map((r) => r.query)
    .filter(Boolean);

  const summaryEn = `Average interest ${avgInterest}/100 (peak ${peakInterest}). Trend is ${trendDirection}. ${risingCount} rising related queries, ${commercialHits} with commercial intent. Recommendation: ${recommendation}. Note: Google Trends is relative, not absolute search volume.`;
  const summaryRu = `Средний интерес ${avgInterest}/100 (пик ${peakInterest}). Динамика: ${trendDirection === "growing" ? "растёт" : trendDirection === "declining" ? "падает" : "стабильно"}. Rising-запросов: ${risingCount}, с коммерческим intent: ${commercialHits}. Рекомендация: ${recommendation}. Важно: Google Trends — относительный интерес, не абсолютный объём поиска.`;

  return {
    avgInterest,
    peakInterest,
    trendDirection,
    recommendation,
    commercialHits,
    risingCount,
    volumeProxy,
    summaryEn,
    summaryRu,
    offerIdeas,
  };
}

export function computeTrendsScore(insight: TrendInsight): number {
  let score = 0;
  score += Math.min(35, insight.avgInterest * 0.35);
  score += Math.min(15, insight.peakInterest * 0.1);
  if (insight.trendDirection === "growing") score += 20;
  else if (insight.trendDirection === "stable") score += 8;
  score += Math.min(15, insight.risingCount * 2);
  score += Math.min(15, insight.commercialHits * 3);
  if (insight.recommendation === "launch") score += 10;
  else if (insight.recommendation === "test") score += 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}
