import type { KeywordOpportunity } from "../types";

export type PartialOpportunity = Partial<KeywordOpportunity> & {
  queryCluster: string;
  countryCode: string;
};

export type TrendTimeframe = "now 7-d" | "today 3-m" | "today 12-m" | "today 5-y";

export interface TrendPoint {
  date: string;
  interest: number;
}

export interface RelatedQuery {
  query: string;
  value: number;
}

export interface TrendResearchResult {
  provider: string;
  query: string;
  country: string;
  geo?: string;
  timeframe: string;
  points: TrendPoint[];
  relatedTop: RelatedQuery[];
  relatedRising: RelatedQuery[];
  regions?: Array<{ region: string; interest: number }>;
  cached?: boolean;
  runId?: string;
}

export interface KeywordProvider {
  readonly name: string;
  search(params: {
    query: string;
    country: string;
  }): Promise<PartialOpportunity[]>;
  research?(params: {
    query: string;
    country: string;
    timeframe?: string;
  }): Promise<TrendResearchResult>;
}
