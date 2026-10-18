"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  CompetitionBadge,
  RecommendationBadge,
  TrendBadge,
} from "@/components/status-badges";
import { formatVolume } from "@/lib/utils";
import { downloadMarketXml } from "@/lib/markets-export";
import { Link } from "@/i18n/navigation";
import type { MarketOverview } from "@/lib/trends/overview-types";
import { Download } from "lucide-react";

export function MarketsView() {
  const t = useTranslations("markets");
  const locale = useLocale();
  const [data, setData] = useState<MarketOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/trends/overview");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setData(json.data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  async function startRefresh() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/trends/refresh", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      toast.success(t("refreshStarted"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("error"));
    } finally {
      setRefreshing(false);
    }
  }

  if (loading && !data) {
    return <div className="py-16 text-center text-slate-500">…</div>;
  }
  if (!data) return null;

  const itNiches = data.byNiche.filter((n) => n.category === "it_services");
  const digNiches = data.byNiche.filter((n) => n.category === "digital_products");

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-slate-900 md:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">
            {t("subtitle")}
          </p>
          <p className="mt-2 text-xs text-amber-800/90">{t("disclaimer")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const stamp = new Date().toISOString().slice(0, 10);
              downloadMarketXml(data, locale, `wordstat-markets-${stamp}.xml`);
              toast.success(t("xmlDownloaded"));
            }}
            disabled={!data}
          >
            <Download className="mr-1.5 h-4 w-4" />
            {t("downloadXml")}
          </Button>
          <Button variant="outline" onClick={load} disabled={loading}>
            {t("reload")}
          </Button>
          <Button onClick={startRefresh} disabled={refreshing}>
            {refreshing ? t("refreshing") : t("refreshAll")}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label={t("kpiRows")} value={data.totals.opportunities} />
        <Kpi label={t("kpiTrends")} value={data.totals.trendsRows} />
        <Kpi label={t("kpiNiches")} value={data.totals.niches} />
        <Kpi label={t("kpiCountries")} value={data.totals.countries} />
      </div>

      {data.lastRefresh && (
        <p className="text-xs text-slate-500">
          {t("lastRefresh")}: {data.lastRefresh.status} · {data.lastRefresh.done}/
          {data.lastRefresh.total}
          {data.lastRefresh.finishedAt
            ? ` · ${new Date(data.lastRefresh.finishedAt).toLocaleString(locale)}`
            : ""}
        </p>
      )}

      <section className="space-y-3">
        <h2 className="font-display text-xl text-slate-900">{t("byCountry")}</h2>
        <p className="text-xs text-slate-500">{t("byCountryHint")}</p>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("colCountry")}</th>
                <th>{t("colAvgScore")}</th>
                <th>{t("colLaunch")}</th>
                <th>{t("colTopNiche")}</th>
              </tr>
            </thead>
            <tbody>
              {data.byCountry.map((row) => (
                <tr key={row.countryCode}>
                  <td className="font-medium">
                    {locale === "ru" ? row.countryNameRu : row.countryNameEn}
                  </td>
                  <td className="font-semibold tabular-nums text-teal-800">
                    {row.avgScore}
                  </td>
                  <td className="tabular-nums">{row.launchCount}</td>
                  <td>{locale === "ru" ? row.topNicheRu : row.topNicheEn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <NicheTable
          title={t("itServices")}
          rows={itNiches}
          locale={locale}
          labels={{
            colNiche: t("colNiche"),
            colAvgScore: t("colAvgScore"),
            colCountries: t("colCountries"),
            colLaunch: t("colLaunch"),
          }}
        />
        <NicheTable
          title={t("digitalProducts")}
          rows={digNiches}
          locale={locale}
          labels={{
            colNiche: t("colNiche"),
            colAvgScore: t("colAvgScore"),
            colCountries: t("colCountries"),
            colLaunch: t("colLaunch"),
          }}
        />
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-xl text-slate-900">{t("matrix")}</h2>
        <p className="text-xs text-slate-500">{t("matrixHint")}</p>
        <div className="table-wrap max-h-[480px]">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("colNiche")}</th>
                <th>{t("colCountry")}</th>
                <th>{t("colAvgScore")}</th>
                <th>{t("colVolume")}</th>
                <th>{t("colLaunch")}</th>
                <th>{t("colTopQuery")}</th>
                <th>{t("colSource")}</th>
              </tr>
            </thead>
            <tbody>
              {data.matrix.slice(0, 80).map((cell) => (
                <tr key={`${cell.nicheId}-${cell.countryCode}`}>
                  <td>
                    {locale === "ru" ? cell.nicheNameRu : cell.nicheNameEn}
                  </td>
                  <td>{cell.countryCode}</td>
                  <td className="font-semibold tabular-nums text-teal-800">
                    {cell.avgScore}
                  </td>
                  <td className="tabular-nums">
                    {formatVolume(cell.avgVolume, locale)}
                  </td>
                  <td className="tabular-nums">{cell.launchCount}</td>
                  <td className="max-w-[220px] truncate text-slate-700">
                    {cell.topQuery}
                  </td>
                  <td className="text-[11px] text-slate-500">
                    {cell.sourceMix.join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <OppList
          title={t("topLaunch")}
          rows={data.topLaunch}
          locale={locale}
          empty={t("empty")}
        />
        <OppList
          title={t("topGrowing")}
          rows={data.topGrowing}
          locale={locale}
          empty={t("empty")}
        />
      </div>

      <section className="space-y-2">
        <h2 className="font-display text-xl text-slate-900">{t("rising")}</h2>
        <p className="text-xs text-slate-500">{t("risingHint")}</p>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("colQuery")}</th>
                <th>{t("colCountry")}</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {data.risingQueries.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-slate-500">
                    {t("risingEmpty")}
                  </td>
                </tr>
              ) : (
                data.risingQueries.map((r) => (
                  <tr key={`${r.country}-${r.query}`}>
                    <td>{r.query}</td>
                    <td>{r.country}</td>
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

function NicheTable({
  title,
  rows,
  locale,
  labels,
}: {
  title: string;
  rows: MarketOverview["byNiche"];
  locale: string;
  labels: {
    colNiche: string;
    colAvgScore: string;
    colCountries: string;
    colLaunch: string;
  };
}) {
  return (
    <section className="space-y-2">
      <h2 className="font-display text-xl text-slate-900">{title}</h2>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>{labels.colNiche}</th>
              <th>{labels.colAvgScore}</th>
              <th>{labels.colCountries}</th>
              <th>{labels.colLaunch}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((n) => (
              <tr key={n.nicheId}>
                <td className="font-medium">
                  {locale === "ru" ? n.nicheNameRu : n.nicheNameEn}
                </td>
                <td className="font-semibold tabular-nums text-teal-800">
                  {n.avgScore}
                </td>
                <td className="tabular-nums">{n.countriesCovered}</td>
                <td className="tabular-nums">{n.launchCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function OppList({
  title,
  rows,
  locale,
  empty,
}: {
  title: string;
  rows: MarketOverview["topLaunch"];
  locale: string;
  empty: string;
}) {
  return (
    <section className="space-y-2">
      <h2 className="font-display text-xl text-slate-900">{title}</h2>
      <div className="space-y-2">
        {rows.length === 0 ? (
          <div className="surface px-4 py-6 text-sm text-slate-500">{empty}</div>
        ) : (
          rows.map((o) => (
            <Link
              key={o.id}
              href={`/opportunities?q=${encodeURIComponent(o.queryCluster)}`}
              className="surface block px-4 py-3 transition-colors hover:border-teal-300"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-slate-900">{o.queryCluster}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {locale === "ru" ? o.countryNameRu : o.countryNameEn} ·{" "}
                    {locale === "ru" ? o.nicheNameRu : o.nicheNameEn} ·{" "}
                    {formatVolume(o.searchVolume, locale)} · {o.source}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-xl text-teal-800">
                    {o.opportunityScore}
                  </div>
                  <div className="mt-1 flex flex-wrap justify-end gap-1">
                    <TrendBadge value={o.trend} />
                    <RecommendationBadge value={o.recommendation} />
                    <CompetitionBadge value={o.competition} />
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
