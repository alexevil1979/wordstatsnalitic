import type { Recommendation, Trend } from "@/lib/types";
import type { RelatedQuery, TrendResearchResult } from "@/lib/providers/types";

export interface TrendInsight {
  avgInterest: number;
  peakInterest: number;
  trendDirection: Trend;
  recommendation: Recommendation;
  commercialHits: number;
  risingCount: number;
  volumeProxy: number;
  summaryEn: string;
  summaryRu: string;
  offerIdeas: string[];
}

export type ResearchResponse = TrendResearchResult & {
  insight: TrendInsight;
  score: number;
  runId: string;
  cached: boolean;
};

export type NicheAnalysisClient = {
  nicheId: string;
  country: string;
  timeframe: string;
  queries: Array<{
    query: string;
    ok: boolean;
    error?: string;
    research?: ResearchResponse;
  }>;
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
