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
import { Download } from "lucide-react";
import { SphereSelect } from "@/components/spheres/sphere-select";
import { getSphere } from "@/data/spheres";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  function onSphereChange(id: string) {
    setSphere(id);
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("sphere", id);
    else url.searchParams.delete("sphere");
    window.history.replaceState({}, "", url.toString());
  }

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

  const sphereMeta = sphere ? getSphere(sphere) : null;
  const nicheKey = sphereMeta?.nicheId || sphereMeta?.id || "";

  const filtered = useMemo(() => {
    if (!data || !nicheKey) return data;
    const byNiche = data.byNiche.filter(
      (n) => n.nicheId === nicheKey || n.nicheId.includes(nicheKey)
    );
    const matrix = data.matrix.filter(
      (c) => c.nicheId === nicheKey || c.nicheId.includes(nicheKey)
    );
    const topLaunch = data.topLaunch.filter(
      (o) => o.nicheId === nicheKey || o.nicheId.includes(nicheKey)
    );
    const topGrowing = data.topGrowing.filter(
      (o) => o.nicheId === nicheKey || o.nicheId.includes(nicheKey)
    );
    return { ...data, byNiche, matrix, topLaunch, topGrowing };
  }, [data, nicheKey]);

  if (loading && !data) {
    return <div className="py-16 text-center text-slate-500">…</div>;
  }
  if (!filtered) return null;

  const itNiches = filtered.byNiche.filter((n) => n.category === "it_services");
  const digNiches = filtered.byNiche.filter((n) => n.category === "digital_products");

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
          <div className="mt-4 max-w-xl">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              {ts("label")}
            </label>
            <SphereSelect value={sphere} onChange={onSphereChange} allowAll />
          </div>
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
          <Button variant="outline" onClick={load} disabled={loading}>
            {t("reload")}
          </Button>
          {isAdmin ? (
            <Button onClick={startRefresh} disabled={refreshing}>
              {refreshing ? t("refreshing") : t("refreshAll")}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label={t("kpiRows")} value={filtered.totals.opportunities} />
        <Kpi label={t("kpiTrends")} value={filtered.totals.trendsRows} />
        <Kpi label={t("kpiNiches")} value={filtered.byNiche.length || filtered.totals.niches} />
        <Kpi label={t("kpiCountries")} value={filtered.totals.countries} />
      </div>

      {filtered.lastRefresh && (
        <p className="text-xs text-slate-500">
          {t("lastRefresh")}: {filtered.lastRefresh.status} · {filtered.lastRefresh.done}/
          {filtered.lastRefresh.total}
          {filtered.lastRefresh.finishedAt
            ? ` · ${new Date(filtered.lastRefresh.finishedAt).toLocaleString(locale)}`
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
              {filtered.byCountry.map((row) => (
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
              {filtered.matrix.slice(0, 80).map((cell) => (
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
          rows={filtered.topLaunch}
          locale={locale}
          empty={t("empty")}
        />
        <OppList
          title={t("topGrowing")}
          rows={filtered.topGrowing}
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
              {filtered.risingQueries.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-slate-500">
                    {t("risingEmpty")}
                  </td>
                </tr>
              ) : (
                filtered.risingQueries.map((r) => (
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
