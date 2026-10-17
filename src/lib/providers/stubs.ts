import type { KeywordProvider, PartialOpportunity } from "./types";

/**
 * Stubs for future live keyword APIs.
 * Wire credentials via env and replace throw with real HTTP calls.
 */
export class DataForSeoProvider implements KeywordProvider {
  readonly name = "dataforseo";

  async search(params: {
    query: string;
    country: string;
  }): Promise<PartialOpportunity[]> {
    void params;
    // TODO: DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD → keywords_data API
    throw new Error(
      "DataForSeoProvider not configured. Set credentials and implement API call."
    );
  }
}

export class AhrefsProvider implements KeywordProvider {
  readonly name = "ahrefs";

  async search(params: {
    query: string;
    country: string;
  }): Promise<PartialOpportunity[]> {
    void params;
    // TODO: AHREFS_API_TOKEN → Keywords Explorer
    throw new Error(
      "AhrefsProvider not configured. Set AHREFS_API_TOKEN and implement API call."
    );
  }
}

export class GoogleTrendsProvider implements KeywordProvider {
  readonly name = "google_trends";

  async search(params: {
    query: string;
    country: string;
  }): Promise<PartialOpportunity[]> {
    void params;
    // TODO: trends interest-over-time for relative dynamics
    throw new Error(
      "GoogleTrendsProvider not configured. Implement Trends client."
    );
  }
}
