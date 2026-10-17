"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  CompetitionBadge,
  RecommendationBadge,
} from "@/components/status-badges";
import { formatVolume } from "@/lib/utils";
import type { DashboardStats } from "@/lib/types";

export function DashboardView() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((j) => setStats(j.data));
  }, []);

  if (!stats) {
    return <div className="py-16 text-center text-slate-500">…</div>;
  }

  const kpis = [
    { label: t("total"), value: stats.totalOpportunities },
    { label: t("launchReady"), value: stats.launchReady },
    { label: t("avgScore"), value: stats.avgScore },
    { label: t("growing"), value: `${stats.growingShare}%` },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-slate-900 md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
          {t("subtitle")}
        </p>
        <p className="mt-2 text-xs text-slate-500">{t("disclaimer")}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="surface px-4 py-4">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {k.label}
            </div>
            <div className="mt-2 font-display text-3xl text-slate-900">{k.value}</div>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-xl text-slate-900">{t("topByCountry")}</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("country")}</th>
                <th>{t("topNiche")}</th>
                <th>{t("avg")}</th>
                <th>{t("launch")}</th>
              </tr>
            </thead>
            <tbody>
              {stats.topByCountry.map((row) => (
                <tr key={row.countryCode}>
                  <td>
                    <Link
                      href={`/opportunities?country=${row.countryCode}`}
                      className="font-medium text-teal-800 hover:underline"
                    >
                      {locale === "ru" ? row.countryNameRu : row.countryNameEn}
                    </Link>
                  </td>
                  <td>{locale === "ru" ? row.topNicheRu : row.topNicheEn}</td>
                  <td className="font-semibold tabular-nums text-teal-800">
                    {row.avgScore}
                  </td>
                  <td className="tabular-nums">{row.launchCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <OpportunityList
          title={t("topMargin")}
          rows={stats.topMarginLowCompetition}
          locale={locale}
        />
        <OpportunityList
          title={t("topScores")}
          rows={stats.topScores}
          locale={locale}
        />
      </div>
    </div>
  );
}

function OpportunityList({
  title,
  rows,
  locale,
}: {
  title: string;
  rows: DashboardStats["topScores"];
  locale: string;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl text-slate-900">{title}</h2>
      <div className="space-y-2">
        {rows.map((o) => (
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
                  {formatVolume(o.searchVolume, locale)}/mo
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-xl text-teal-800">
                  {o.opportunityScore}
                </div>
                <div className="mt-1 flex flex-wrap justify-end gap-1">
                  <CompetitionBadge value={o.competition} />
                  <RecommendationBadge value={o.recommendation} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
