import type { MarketOverview } from "@/lib/trends/overview-types";

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function tag(name: string, value: unknown, indent = 2): string {
  const pad = " ".repeat(indent);
  return `${pad}<${name}>${esc(value)}</${name}>\n`;
}

/** Build Wordstat markets analytics as XML document. */
export function marketOverviewToXml(data: MarketOverview, locale: string): string {
  const now = new Date().toISOString();
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<wordstatAnalytics generatedAt="${esc(now)}" locale="${esc(locale)}">\n`;

  xml += `  <totals>\n`;
  xml += tag("opportunities", data.totals.opportunities, 4);
  xml += tag("trendsRows", data.totals.trendsRows, 4);
  xml += tag("niches", data.totals.niches, 4);
  xml += tag("countries", data.totals.countries, 4);
  xml += `  </totals>\n`;

  xml += `  <majorCountries>\n`;
  for (const code of data.majorCountries) {
    xml += tag("country", code, 4);
  }
  xml += `  </majorCountries>\n`;

  if (data.lastRefresh) {
    xml += `  <lastRefresh>\n`;
    xml += tag("id", data.lastRefresh.id, 4);
    xml += tag("status", data.lastRefresh.status, 4);
    xml += tag("done", data.lastRefresh.done, 4);
    xml += tag("failed", data.lastRefresh.failed, 4);
    xml += tag("total", data.lastRefresh.total, 4);
    xml += tag("startedAt", data.lastRefresh.startedAt, 4);
    xml += tag("finishedAt", data.lastRefresh.finishedAt ?? "", 4);
    xml += `  </lastRefresh>\n`;
  }

  xml += `  <byCountry>\n`;
  for (const row of data.byCountry) {
    xml += `    <row>\n`;
    xml += tag("countryCode", row.countryCode, 6);
    xml += tag(
      "countryName",
      locale === "ru" ? row.countryNameRu : row.countryNameEn,
      6
    );
    xml += tag("avgScore", row.avgScore, 6);
    xml += tag("launchCount", row.launchCount, 6);
    xml += tag(
      "topNiche",
      locale === "ru" ? row.topNicheRu : row.topNicheEn,
      6
    );
    xml += `    </row>\n`;
  }
  xml += `  </byCountry>\n`;

  xml += `  <byNiche>\n`;
  for (const row of data.byNiche) {
    xml += `    <row>\n`;
    xml += tag("nicheId", row.nicheId, 6);
    xml += tag("nicheName", locale === "ru" ? row.nicheNameRu : row.nicheNameEn, 6);
    xml += tag("category", row.category, 6);
    xml += tag("avgScore", row.avgScore, 6);
    xml += tag("countriesCovered", row.countriesCovered, 6);
    xml += tag("launchCount", row.launchCount, 6);
    xml += `    </row>\n`;
  }
  xml += `  </byNiche>\n`;

  xml += `  <matrix>\n`;
  for (const cell of data.matrix) {
    xml += `    <cell>\n`;
    xml += tag("nicheId", cell.nicheId, 6);
    xml += tag(
      "nicheName",
      locale === "ru" ? cell.nicheNameRu : cell.nicheNameEn,
      6
    );
    xml += tag("category", cell.category, 6);
    xml += tag("countryCode", cell.countryCode, 6);
    xml += tag("avgScore", cell.avgScore, 6);
    xml += tag("avgVolume", cell.avgVolume, 6);
    xml += tag("launchCount", cell.launchCount, 6);
    xml += tag("growingCount", cell.growingCount, 6);
    xml += tag("rowCount", cell.rowCount, 6);
    xml += tag("topQuery", cell.topQuery, 6);
    xml += tag("sources", cell.sourceMix.join(","), 6);
    xml += `    </cell>\n`;
  }
  xml += `  </matrix>\n`;

  xml += `  <topLaunch>\n`;
  for (const o of data.topLaunch) {
    xml += `    <opportunity>\n`;
    xml += tag("id", o.id, 6);
    xml += tag("query", o.queryCluster, 6);
    xml += tag("countryCode", o.countryCode, 6);
    xml += tag(
      "countryName",
      locale === "ru" ? o.countryNameRu : o.countryNameEn,
      6
    );
    xml += tag("nicheId", o.nicheId, 6);
    xml += tag("nicheName", locale === "ru" ? o.nicheNameRu : o.nicheNameEn, 6);
    xml += tag("searchVolume", o.searchVolume, 6);
    xml += tag("trend", o.trend, 6);
    xml += tag("competition", o.competition, 6);
    xml += tag("recommendation", o.recommendation, 6);
    xml += tag("score", o.opportunityScore ?? 0, 6);
    xml += tag("source", o.source, 6);
    xml += tag(
      "exampleOffer",
      locale === "ru" ? o.exampleOfferRu : o.exampleOffer,
      6
    );
    xml += tag("priceRange", o.priceRange, 6);
    xml += `    </opportunity>\n`;
  }
  xml += `  </topLaunch>\n`;

  xml += `  <topGrowing>\n`;
  for (const o of data.topGrowing) {
    xml += `    <opportunity>\n`;
    xml += tag("id", o.id, 6);
    xml += tag("query", o.queryCluster, 6);
    xml += tag("countryCode", o.countryCode, 6);
    xml += tag("nicheId", o.nicheId, 6);
    xml += tag("searchVolume", o.searchVolume, 6);
    xml += tag("trend", o.trend, 6);
    xml += tag("recommendation", o.recommendation, 6);
    xml += tag("score", o.opportunityScore ?? 0, 6);
    xml += tag("source", o.source, 6);
    xml += `    </opportunity>\n`;
  }
  xml += `  </topGrowing>\n`;

  xml += `  <risingQueries>\n`;
  for (const r of data.risingQueries) {
    xml += `    <item>\n`;
    xml += tag("query", r.query, 6);
    xml += tag("country", r.country, 6);
    xml += tag("value", r.value, 6);
    xml += `    </item>\n`;
  }
  xml += `  </risingQueries>\n`;

  xml += `</wordstatAnalytics>\n`;
  return xml;
}

export function downloadMarketXml(
  data: MarketOverview,
  locale: string,
  filename: string
) {
  const xml = marketOverviewToXml(data, locale);
  const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
