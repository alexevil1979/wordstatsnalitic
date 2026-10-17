import type {
  Competition,
  KeywordOpportunity,
  MarginLevel,
  Recommendation,
  Trend,
} from "./types";

const volumeScore = (volume: number) => {
  if (volume >= 8000) return 30;
  if (volume >= 4000) return 24;
  if (volume >= 2000) return 18;
  if (volume >= 800) return 12;
  if (volume >= 300) return 8;
  return 4;
};

const competitionScore: Record<Competition, number> = {
  low: 30,
  medium: 18,
  high: 6,
};

const marginScore: Record<MarginLevel, number> = {
  high: 25,
  medium: 14,
};

const recommendationBonus: Record<Recommendation, number> = {
  launch: 15,
  test: 8,
  not_now: 0,
};

const trendBonus: Record<Trend, number> = {
  growing: 5,
  stable: 2,
  declining: 0,
};

/** Transparent opportunity score 0–100 for dashboard ranking. */
export function computeOpportunityScore(
  row: Pick<
    KeywordOpportunity,
    | "searchVolume"
    | "competition"
    | "marginPotential"
    | "recommendation"
    | "trend"
  >
): number {
  const raw =
    volumeScore(row.searchVolume) +
    competitionScore[row.competition] +
    marginScore[row.marginPotential] +
    recommendationBonus[row.recommendation] +
    trendBonus[row.trend];
  return Math.max(0, Math.min(100, raw));
}

export function withScore<T extends KeywordOpportunity>(row: T): T & { opportunityScore: number } {
  return { ...row, opportunityScore: computeOpportunityScore(row) };
}
