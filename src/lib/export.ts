import type { KeywordOpportunity } from "./types";
import * as XLSX from "xlsx";

function rowsForExport(data: KeywordOpportunity[], locale: string) {
  return data.map((o) => ({
    query: o.queryCluster,
    country: locale === "ru" ? o.countryNameRu : o.countryNameEn,
    countryCode: o.countryCode,
    niche: locale === "ru" ? o.nicheNameRu : o.nicheNameEn,
    nicheId: o.nicheId,
    searchVolume: o.searchVolume,
    trend: o.trend,
    competition: o.competition,
    commercialIntent: o.commercialIntent,
    marginPotential: o.marginPotential,
    entryDifficulty: o.entryDifficulty,
    recommendation: o.recommendation,
    exampleOffer: locale === "ru" ? o.exampleOfferRu : o.exampleOffer,
    priceRange: o.priceRange,
    score: o.opportunityScore,
    source: o.source,
    confidence: o.confidence,
  }));
}

export function exportToCsv(data: KeywordOpportunity[], locale: string): string {
  const rows = rowsForExport(data, locale);
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape((r as Record<string, unknown>)[h])).join(",")),
  ].join("\n");
}

export function downloadCsv(data: KeywordOpportunity[], locale: string, filename: string) {
  const csv = exportToCsv(data, locale);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadExcel(data: KeywordOpportunity[], locale: string, filename: string) {
  const rows = rowsForExport(data, locale);
  const sheet = XLSX.utils.json_to_sheet(rows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Opportunities");
  XLSX.writeFile(book, filename);
}
