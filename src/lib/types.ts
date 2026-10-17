export type Trend = "growing" | "stable" | "declining";
export type Competition = "low" | "medium" | "high";
export type IntentLevel = "high" | "medium";
export type MarginLevel = "high" | "medium";
export type EntryDifficulty = "low" | "medium" | "high";
export type Recommendation = "launch" | "test" | "not_now";
export type NicheCategory = "it_services" | "digital_products";

export interface Country {
  code: string;
  nameRu: string;
  nameEn: string;
  region: string;
  currency: string;
}

export interface Niche {
  id: string;
  category: NicheCategory;
  nameRu: string;
  nameEn: string;
}

export interface KeywordOpportunity {
  id: string;
  countryCode: string;
  nicheId: string;
  queryCluster: string;
  searchVolume: number;
  trend: Trend;
  competition: Competition;
  commercialIntent: IntentLevel;
  marginPotential: MarginLevel;
  entryDifficulty: EntryDifficulty;
  recommendation: Recommendation;
  exampleOffer: string;
  exampleOfferRu: string;
  priceRange: string;
  source: string;
  confidence: number;
  updatedAt?: string;
  opportunityScore?: number;
  countryNameRu?: string;
  countryNameEn?: string;
  nicheNameRu?: string;
  nicheNameEn?: string;
  nicheCategory?: NicheCategory;
}

export interface Insight {
  id: string;
  rank: number;
  titleRu: string;
  titleEn: string;
  bodyRu: string;
  bodyEn: string;
  nicheIds: string[];
  countryCodes: string[];
}

export interface OpportunityFilters {
  country?: string;
  niche?: string;
  category?: NicheCategory | "";
  competition?: Competition | "";
  margin?: MarginLevel | "";
  recommendation?: Recommendation | "";
  trend?: Trend | "";
  q?: string;
  sort?: string;
  order?: "asc" | "desc";
}

export interface DashboardStats {
  totalOpportunities: number;
  launchReady: number;
  avgScore: number;
  growingShare: number;
  topByCountry: Array<{
    countryCode: string;
    countryNameRu: string;
    countryNameEn: string;
    topNicheId: string;
    topNicheRu: string;
    topNicheEn: string;
    avgScore: number;
    launchCount: number;
  }>;
  topMarginLowCompetition: KeywordOpportunity[];
  topScores: KeywordOpportunity[];
}

export type Locale = "ru" | "en";
