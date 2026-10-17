import { getSetting } from "@/lib/settings";
import type { KeywordProvider, PartialOpportunity, TrendResearchResult } from "./types";

/**
 * Stubs for paid keyword APIs — throw until credentials are set.
 * Wire real HTTP when keys appear in Settings / env.
 */
export class DataForSeoProvider implements KeywordProvider {
  readonly name = "dataforseo";

  private ensure() {
    const login = getSetting("DATAFORSEO_LOGIN");
    const password = getSetting("DATAFORSEO_PASSWORD");
    if (!login || !password) {
      throw new Error(
        "DataForSEO credentials missing. Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in Settings."
      );
    }
    return { login, password };
  }

  async research(params: {
    query: string;
    country: string;
    timeframe?: string;
  }): Promise<TrendResearchResult> {
    this.ensure();
    void params;
    // TODO: keywords_data/google_trends/explore/live
    throw new Error(
      "DataForSeoProvider credentials are set, but the Trends HTTP client is not implemented yet."
    );
  }

  async search(params: {
    query: string;
    country: string;
  }): Promise<PartialOpportunity[]> {
    this.ensure();
    void params;
    throw new Error(
      "DataForSeoProvider credentials are set, but the Keywords API client is not implemented yet."
    );
  }
}

export class AhrefsProvider implements KeywordProvider {
  readonly name = "ahrefs";

  private ensure() {
    const token = getSetting("AHREFS_API_TOKEN");
    if (!token) {
      throw new Error("AHREFS_API_TOKEN is not configured. Add it in Settings.");
    }
    return token;
  }

  async research(params: {
    query: string;
    country: string;
    timeframe?: string;
  }): Promise<TrendResearchResult> {
    this.ensure();
    void params;
    throw new Error(
      "AhrefsProvider token is set, but the Trends/volume client is not implemented yet."
    );
  }

  async search(params: {
    query: string;
    country: string;
  }): Promise<PartialOpportunity[]> {
    this.ensure();
    void params;
    throw new Error(
      "AhrefsProvider token is set, but the Keywords Explorer client is not implemented yet."
    );
  }
}
