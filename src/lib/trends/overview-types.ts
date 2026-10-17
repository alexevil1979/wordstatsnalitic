import type { KeywordOpportunity } from "@/lib/types";

export type NicheCountryCell = {
  nicheId: string;
  nicheNameRu: string;
  nicheNameEn: string;
  category: string;
  countryCode: string;
  avgScore: number;
  avgVolume: number;
  launchCount: number;
  growingCount: number;
  rowCount: number;
  topQuery: string;
  sourceMix: string[];
};

export type MarketOverview = {
  majorCountries: string[];
  lastRefresh: {
    id: string;
    status: string;
    done: number;
    failed: number;
    total: number;
    finishedAt: string | null;
    startedAt: string;
  } | null;
  matrix: NicheCountryCell[];
  topLaunch: KeywordOpportunity[];
  topGrowing: KeywordOpportunity[];
  risingQueries: Array<{ query: string; value: number; country: string }>;
  byNiche: Array<{
    nicheId: string;
    nicheNameRu: string;
    nicheNameEn: string;
    category: string;
    avgScore: number;
    countriesCovered: number;
    launchCount: number;
  }>;
  byCountry: Array<{
    countryCode: string;
    countryNameRu: string;
    countryNameEn: string;
    avgScore: number;
    launchCount: number;
    topNicheRu: string;
    topNicheEn: string;
  }>;
  totals: {
    opportunities: number;
    trendsRows: number;
    niches: number;
    countries: number;
  };
};
