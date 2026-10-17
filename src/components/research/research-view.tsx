"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CompetitionBadge,
  RecommendationBadge,
  TrendBadge,
} from "@/components/status-badges";
import type { ResearchResponse } from "@/lib/trends/types";

type Meta = {
  countries: Array<{ code: string; nameRu: string; nameEn: string }>;
  niches: Array<{ id: string; nameRu: string; nameEn: string }>;
};

const TIMEFRAMES = [
  { value: "now 7-d", labelKey: "tf7d" as const },
  { value: "today 3-m", labelKey: "tf3m" as const },
  { value: "today 12-m", labelKey: "tf12m" as const },
  { value: "today 5-y", labelKey: "tf5y" as const },
];

export function ResearchView() {
  const t = useTranslations("research");
  const locale = useLocale();
  const [meta, setMeta] = useState<Meta | null>(null);
  const [query, setQuery] = useState("ai agent for business");
  const [country, setCountry] = useState("US");
  const [timeframe, setTimeframe] = useState("today 12-m");
  const [nicheId, setNicheId] = useState("ai-agents");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResponse | null>(null);

  useEffect(() => {
    fetch("/api/meta")
      .then((r) => r.json())
      .then((j) => {
        setMeta(j.data);
        if (j.data?.niches?.[0]) setNicheId(j.data.niches[0].id);
      });
  }, []);

  const maxInterest = useMemo(() => {
    if (!result?.points.length) return 100;
    return Math.max(100, ...result.points.map((p) => p.interest));
  }, [result]);

  async function runResearch(force = false) {
    setLoading(true);
    try {
      const res = await fetch("/api/trends/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, country, timeframe, force }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setResult(json.data);
      toast.success(json.data.cached ? t("cached") : t("fresh"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("error"));
    } finally {
      setLoading(false);
    }
  }

  async function addToCatalog() {
    if (!result) return;
    try {
      const res = await fetch("/api/trends/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: result.query,
          country: result.country,
          nicheId,
          timeframe: result.timeframe,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      toast.success(json.data.created ? t("added") : t("updated"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("error"));
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-slate-900 md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
          {t("subtitle")}
        </p>
        <p className="mt-2 text-xs text-amber-800/90">{t("disclaimer")}</p>
      </div>

      <div className="surface space-y-4 p-4 md:p-5">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2 space-y-1.5">
            <Label>{t("query")}</Label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("queryPlaceholder")}
              onKeyDown={(e) => e.key === "Enter" && runResearch()}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("country")}</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(meta?.countries ?? []).map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {locale === "ru" ? c.nameRu : c.nameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("timeframe")}</Label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEFRAMES.map((tf) => (
                  <SelectItem key={tf.value} value={tf.value}>
                    {t(tf.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => runResearch(false)} disabled={loading || !query.trim()}>
            {loading ? t("loading") : t("run")}
          </Button>
          <Button
            variant="outline"
            onClick={() => runResearch(true)}
            disabled={loading || !query.trim()}
          >
            {t("force")}
          </Button>
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi label={t("avg")} value={result.insight.avgInterest} />
            <Kpi label={t("peak")} value={result.insight.peakInterest} />
            <Kpi label={t("score")} value={result.score} />
            <div className="surface px-4 py-4 space-y-2">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                {t("signals")}
              </div>
              <div className="flex flex-wrap gap-1">
                <TrendBadge value={result.insight.trendDirection} />
                <RecommendationBadge value={result.insight.recommendation} />
                <CompetitionBadge
                  value={
                    result.insight.risingCount >= 8
                      ? "high"
                      : result.insight.risingCount >= 3
                        ? "medium"
                        : "low"
                  }
                />
              </div>
              <div className="text-xs text-slate-500">
                {result.provider}
                {result.cached ? ` · ${t("cached")}` : ""}
              </div>
            </div>
          </div>

          <section className="surface p-4 md:p-5 space-y-3">
            <h2 className="font-display text-xl text-slate-900">{t("chart")}</h2>
            <div className="flex h-40 items-end gap-px overflow-x-auto rounded-md bg-slate-50 p-2">
              {result.points.length === 0 ? (
                <div className="m-auto text-sm text-slate-500">{t("noPoints")}</div>
              ) : (
                result.points.map((p) => (
                  <div
                    key={p.date}
                    title={`${p.date}: ${p.interest}`}
                    className="min-w-[3px] flex-1 rounded-t bg-teal-700/80 hover:bg-teal-600"
                    style={{ height: `${Math.max(2, (p.interest / maxInterest) * 100)}%` }}
                  />
                ))
              )}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <RelatedTable title={t("rising")} rows={result.relatedRising} />
            <RelatedTable title={t("top")} rows={result.relatedTop} />
          </div>

          <section className="surface space-y-3 p-4 md:p-5">
            <h2 className="font-display text-xl text-slate-900">{t("insight")}</h2>
            <p className="text-sm leading-relaxed text-slate-700">
              {locale === "ru" ? result.insight.summaryRu : result.insight.summaryEn}
            </p>
            {result.insight.offerIdeas.length > 0 && (
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                {result.insight.offerIdeas.map((idea) => (
                  <li key={idea}>{idea}</li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap items-end gap-3 border-t border-slate-100 pt-4">
              <div className="space-y-1.5">
                <Label>{t("niche")}</Label>
                <Select value={nicheId} onValueChange={setNicheId}>
                  <SelectTrigger className="w-[240px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(meta?.niches ?? []).map((n) => (
                      <SelectItem key={n.id} value={n.id}>
                        {locale === "ru" ? n.nameRu : n.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addToCatalog}>{t("addCatalog")}</Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface px-4 py-4">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-2 font-display text-3xl text-slate-900">{value}</div>
    </div>
  );
}

function RelatedTable({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ query: string; value: number }>;
}) {
  return (
    <section className="space-y-2">
      <h2 className="font-display text-xl text-slate-900">{title}</h2>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Query</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={2} className="text-slate-500">
                  —
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.query}>
                  <td>{r.query}</td>
                  <td className="tabular-nums">
                    {r.value >= 5000 ? "Breakout" : r.value}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
