import { db } from "@/db";
import { opportunities } from "@/db/schema";
import { like, and, eq } from "drizzle-orm";
import type { KeywordProvider, PartialOpportunity } from "./types";

/** MVP provider: reads expert-estimate rows already in SQLite. */
export class ExpertSeedProvider implements KeywordProvider {
  readonly name = "expert_seed";

  async search(params: {
    query: string;
    country: string;
  }): Promise<PartialOpportunity[]> {
    const rows = db
      .select()
      .from(opportunities)
      .where(
        and(
          eq(opportunities.countryCode, params.country),
          like(opportunities.queryCluster, `%${params.query}%`)
        )
      )
      .all();

    return rows.map((r) => ({
      queryCluster: r.queryCluster,
      countryCode: r.countryCode,
      searchVolume: r.searchVolume,
      trend: r.trend as PartialOpportunity["trend"],
      competition: r.competition as PartialOpportunity["competition"],
      source: r.source,
    }));
  }
}
