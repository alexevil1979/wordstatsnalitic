"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  CompetitionBadge,
  RecommendationBadge,
  TrendBadge,
} from "@/components/status-badges";
import { formatVolume } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import type { MarketOverview } from "@/lib/trends/overview-types";
import type { SphereAnalysisClient } from "@/lib/trends/types";
import { Download } from "lucide-react";
import { SphereSelect } from "@/components/spheres/sphere-select";
import { getSphere, sphereLabel } from "@/data/spheres";

const COUNTRIES = [
  { code: "RU", nameRu: "Россия", nameEn: "Russia" },
  { code: "US", nameRu: "США", nameEn: "United States" },
  { code: "GB", nameRu: "Великобритания", nameEn: "United Kingdom" },
  { code: "DE", nameRu: "Германия", nameEn: "Germany" },
  { code: "TR", nameRu: "Турция", nameEn: "Turkey" },
  { code: "AE", nameRu: "ОАЭ", nameEn: "UAE" },
  { code: "SA", nameRu: "Саудовская Аравия", nameEn: "Saudi Arabia" },
  { code: "CN", nameRu: "Китай", nameEn: "China" },
  { code: "IN", nameRu: "Индия", nameEn: "India" },
  { code: "BR", nameRu: "Бразилия", nameEn: "Brazil" },
];

export function MarketsView() {
  const t = useTranslations("markets");
  const ts = useTranslations("spheres");
  const locale = useLocale();
  const sp = useSearchParams();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [data, setData] = useState<MarketOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sphere, setSphere] = useState(sp.get("sphere") || "");
  const [country, setCountry] = useState(
    sp.get("country") || (locale === "ru" ? "RU" : "US")
  );
  const [sphereResult, setSphereResult] = useState<SphereAnalysisClient | null>(null);

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

  useEffect(() => {
    const fromUrl = sp.get("sphere") || "";
    if (fromUrl !== sphere) setSphere(fromUrl);
    const c = sp.get("country");
    if (c && c !== country) setCountry(c);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  function patchUrl(nextSphere: string, nextCountry: string) {
    const url = new URL(window.location.href);
    if (nextSphere) url.searchParams.set("sphere", nextSphere);
    else url.searchParams.delete("sphere");
    if (nextCountry) url.searchParams.set("country", nextCountry);
    else url.searchParams.delete("country");
    window.history.replaceState({}, "", url.toString());
  }

  function onSphereChange(id: string) {
    setSphere(id);
    setSphereResult(null);
    patchUrl(id, country);
  }

  function onCountryChange(code: string) {
    setCountry(code);
    setSphereResult(null);
    patchUrl(sphere, code);
  }

  async function refreshSphere(force = true) {
    if (!sphere) return;
    setRefreshing(true);
    try {
      const res = await fetch("/api/trends/sphere", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sphereId: sphere,
          country,
          timeframe: "today 12-m",
          force,
          queryLimit: 3,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setSphereResult(json.data);
      toast.success(t("sphereReady"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("error"));
    } finally {
      setRefreshing(false);
    }
  }

  async function startRefreshAll() {
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

  async function onUpdateClick() {
    if (sphere) {
      await refreshSphere(true);
      return;
    }
    await load();
  }

  const sphereMeta = sphere ? getSphere(sphere) : null;
  const sphereMode = Boolean(sphere);

  const itNiches = useMemo(
    () => (data?.byNiche ?? []).filter((n) => n.category === "it_services"),
    [data]
  );
  const digNiches = useMemo(
    () => (data?.byNiche ?? []).filter((n) => n.category === "digital_products"),
    [data]
  );

  if (loading && !data && !sphereMode) {
    return <div className="py-16 text-center text-slate-500">…</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl tracking-tight text-slate-900 md:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">
            {t("subtitle")}
          </p>
          <p className="mt-2 text-xs text-amber-800/90">{t("disclaimer")}</p>
          <div className="mt-4 grid max-w-2xl gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                {ts("label")}
              </label>
              <SphereSelect value={sphere} onChange={onSphereChange} allowAll />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                {t("country")}
              </label>
              <select
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm"
                value={country}
                onChange={(e) => onCountryChange(e.target.value)}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {locale === "ru" ? c.nameRu : c.nameEn} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
          {sphereMeta ? (
            <p className="mt-2 text-xs text-slate-500">
              {t("sphereHint", {
                name: sphereLabel(sphereMeta, locale),
              })}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              try {
                const res = await fetch(`/api/markets/export?locale=${locale}`);
                if (res.status === 401) {
                  toast.error(t("loginForXml"));
                  window.location.href = `/${locale}/auth/login`;
                  return;
                }
                if (!res.ok) {
                  const json = await res.json().catch(() => ({}));
                  throw new Error(json.error || "export failed");
                }
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `wordstat-markets-${new Date().toISOString().slice(0, 10)}.xml`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success(t("xmlDownloaded"));
              } catch (e) {
                toast.error(e instanceof Error ? e.message : t("error"));
              }
            }}
            disabled={!data}
          >
            <Download className="mr-1.5 h-4 w-4" />
            {t("downloadXml")}
          </Button>
          <Button onClick={onUpdateClick} disabled={refreshing || (sphereMode && !sphere)}>
            {refreshing
              ? t("refreshing")
              : sphereMode
                ? t("recalcSphere")
                : t("reload")}
          </Button>
          {isAdmin && !sphereMode ? (
            <Button variant="outline" onClick={startRefreshAll} disabled={refreshing}>
              {t("refreshAll")}
            </Button>
          ) : null}
        </div>
      </div>

      {sphereMode ? (
        <SphereResults
          t={t}
          locale={locale}
          sphere={sphereMeta}
          country={country}
          result={sphereResult}
          refreshing={refreshing}
          onRefresh={() => refreshSphere(true)}
        />
      ) : null}

      {!sphereMode && data ? (
        <>
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
        </>
      ) : null}
    </div>
  );
}

function SphereResults({
  t,
  locale,
  sphere,
  country,
  result,
  refreshing,
  onRefresh,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  locale: string;
  sphere: ReturnType<typeof getSphere> | null;
  country: string;
  result: SphereAnalysisClient | null;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  if (!sphere) return null;

  if (!result) {
    return (
      <section className="surface space-y-3 p-6 text-center">
        <h2 className="font-display text-2xl text-slate-900">
          {sphereLabel(sphere, locale)}
        </h2>
        <p className="text-sm text-slate-600">
          {t("sphereEmpty", { country })}
        </p>
        <Button onClick={onRefresh} disabled={refreshing}>
          {refreshing ? t("refreshing") : t("recalcSphere")}
        </Button>
      </section>
    );
  }

  const agg = result.aggregate;
  const summary = locale === "ru" ? agg.summaryRu : agg.summaryEn;

  return (
    <div className="space-y-6">
      <section className="surface space-y-3 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl text-slate-900">
              {locale === "ru" ? result.nameRu : result.nameEn}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {result.country} · {result.timeframe}
            </p>
          </div>
          <div className="font-display text-3xl text-teal-800">{agg.score}</div>
        </div>
        <p className="text-sm leading-relaxed text-slate-700">{summary}</p>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label={t("kpiAvgInterest")} value={agg.avgInterest} />
        <Kpi label={t("kpiPeak")} value={agg.peakInterest} />
        <Kpi label={t("kpiScore")} value={agg.score} />
        <Kpi label={t("kpiRising")} value={agg.risingQueries.length} />
      </div>

      <section className="space-y-2">
        <h3 className="font-display text-xl text-slate-900">{t("seedRanked")}</h3>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("colQuery")}</th>
                <th>{t("kpiAvgInterest")}</th>
                <th>{t("kpiScore")}</th>
                <th>{t("colSignals")}</th>
              </tr>
            </thead>
            <tbody>
              {agg.seedQueriesRanked.map((row) => (
                <tr key={row.query}>
                  <td className="font-medium">{row.query}</td>
                  <td className="tabular-nums">{row.avgInterest}</td>
                  <td className="font-semibold tabular-nums text-teal-800">
                    {row.score}
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      <TrendBadge value={row.trendDirection as never} />
                      <RecommendationBadge value={row.recommendation as never} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <RelatedTable
          title={t("rising")}
          rows={agg.risingQueries}
          empty={t("sphereRisingEmpty")}
        />
        <RelatedTable
          title={t("topRelated")}
          rows={agg.topQueries}
          empty={t("sphereRisingEmpty")}
        />
      </div>
    </div>
  );
}

function RelatedTable({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: Array<{ query: string; value: number }>;
  empty: string;
}) {
  return (
    <section className="space-y-2">
      <h3 className="font-display text-xl text-slate-900">{title}</h3>
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
                  {empty}
                </td>
              </tr>
            ) : (
              rows.slice(0, 25).map((r) => (
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
