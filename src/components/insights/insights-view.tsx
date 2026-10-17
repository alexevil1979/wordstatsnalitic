"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import type { Insight } from "@/lib/types";

export function InsightsView() {
  const t = useTranslations("insights");
  const locale = useLocale();
  const [items, setItems] = useState<Insight[]>([]);

  useEffect(() => {
    fetch("/api/insights")
      .then((r) => r.json())
      .then((j) => setItems(j.data ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-slate-900">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">{t("subtitle")}</p>
      </div>

      <div className="space-y-4">
        {items.map((insight) => {
          const title = locale === "ru" ? insight.titleRu : insight.titleEn;
          const body = locale === "ru" ? insight.bodyRu : insight.bodyEn;
          const href = `/opportunities?${new URLSearchParams({
            niche: insight.nicheIds[0] ?? "",
            country: insight.countryCodes[0] ?? "",
          }).toString()}`;

          return (
            <article key={insight.id} className="surface p-5 md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="max-w-3xl">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">
                    {t("rank", { rank: insight.rank })}
                  </div>
                  <h2 className="mt-2 font-display text-2xl text-slate-900">{title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{body}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span>{insight.countryCodes.join(" · ")}</span>
                    <span>·</span>
                    <span>{insight.nicheIds.join(" · ")}</span>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={href}>{t("viewRelated")}</Link>
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
