import type { Recommendation, Trend } from "@/lib/types";
import type { TrendResearchResult } from "@/lib/providers/types";

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
