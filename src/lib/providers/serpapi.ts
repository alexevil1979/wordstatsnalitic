import { getSetting } from "@/lib/settings";
import type {
  KeywordProvider,
  PartialOpportunity,
  TrendPoint,
  TrendResearchResult,
} from "./types";

/**
 * SerpAPI Google Trends engine — activated when SERPAPI_KEY is set.
 * Docs: https://serpapi.com/google-trends-api
 */
export class SerpApiTrendsProvider implements KeywordProvider {
  readonly name = "serpapi";

  private key() {
    const key = getSetting("SERPAPI_KEY");
    if (!key) {
      throw new Error("SERPAPI_KEY is not configured. Add it in Settings.");
    }
    return key;
  }

  async research(params: {
    query: string;
    country: string;
    timeframe?: string;
  }): Promise<TrendResearchResult> {
    const apiKey = this.key();
    const timeframe = params.timeframe ?? "today 12-m";
    const url = new URL("https://serpapi.com/search.json");
    url.searchParams.set("engine", "google_trends");
    url.searchParams.set("q", params.query);
    url.searchParams.set("geo", params.country);
    url.searchParams.set("date", timeframe);
    url.searchParams.set("api_key", apiKey);

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`SerpAPI HTTP ${res.status}`);
    }
    const data = (await res.json()) as {
      interest_over_time?: {
        timeline_data?: Array<{
          date: string;
          values?: Array<{ extracted_value?: number; value?: string }>;
        }>;
      };
      related_queries?: {
        rising?: Array<{ query: string; extracted_value?: number; value?: string }>;
        top?: Array<{ query: string; extracted_value?: number; value?: string }>;
      };
      error?: string;
    };
    if (data.error) throw new Error(data.error);

    const points: TrendPoint[] = (data.interest_over_time?.timeline_data ?? []).map((row) => ({
      date: row.date,
      interest:
        row.values?.[0]?.extracted_value ??
        (Number(row.values?.[0]?.value) || 0),
    }));

    const mapRelated = (
      rows: Array<{ query: string; extracted_value?: number; value?: string }> | undefined
    ) =>
      (rows ?? []).map((r) => ({
        query: r.query,
        value:
          r.extracted_value ??
          (String(r.value).toLowerCase() === "breakout" ? 5000 : Number(r.value) || 0),
      }));

    return {
      provider: "serpapi",
      query: params.query,
      country: params.country,
      timeframe,
      points,
      relatedTop: mapRelated(data.related_queries?.top),
      relatedRising: mapRelated(data.related_queries?.rising),
      regions: [],
    };
  }

  async search(params: {
    query: string;
    country: string;
  }): Promise<PartialOpportunity[]> {
    const r = await this.research(params);
    const avg =
      r.points.length === 0
        ? 0
        : r.points.reduce((s, p) => s + p.interest, 0) / r.points.length;
    return [
      {
        queryCluster: params.query,
        countryCode: params.country,
        searchVolume: Math.round(avg * 100),
        source: "serpapi",
        confidence: 0.7,
      },
    ];
  }
}
