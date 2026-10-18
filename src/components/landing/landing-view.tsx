"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, KeyRound, LineChart, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { SphereSelect } from "@/components/spheres/sphere-select";
import { SPHERES } from "@/data/spheres";

export function LandingView() {
  const t = useTranslations("landing");
  const locale = useLocale();
  const [sphere, setSphere] = useState("");

  const marketsHref = sphere
    ? `/markets?sphere=${encodeURIComponent(sphere)}`
    : "/markets";

  const caps = [
    { icon: LineChart, title: t("cap1Title"), body: t("cap1Body") },
    { icon: Sparkles, title: t("cap2Title"), body: t("cap2Body") },
    { icon: KeyRound, title: t("cap3Title"), body: t("cap3Body") },
    { icon: Shield, title: t("cap4Title"), body: t("cap4Body") },
  ] as const;

  return (
    <div className="space-y-20 pb-16">
      {/* Hero — brand first, one composition */}
      <section className="relative overflow-hidden rounded-2xl border border-teal-900/10 bg-gradient-to-br from-teal-950 via-teal-900 to-slate-900 px-6 py-14 text-white md:px-12 md:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(94,234,212,0.35), transparent 45%), radial-gradient(circle at 80% 10%, rgba(125,211,252,0.25), transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="font-display text-4xl tracking-tight md:text-6xl">Wordstat</p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-teal-200/90">
            {t("tagline")}
          </p>
          <h1 className="mt-8 font-display text-2xl leading-snug text-white md:text-3xl">
            {t("headline")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-teal-50/85 md:text-base">
            {t("sub")}
          </p>
          <div className="mx-auto mt-8 max-w-lg text-left">
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-teal-200/80">
              {t("sphereLabel")}
            </label>
            <SphereSelect value={sphere} onChange={setSphere} allowAll size="lg" />
            <p className="mt-1.5 text-xs text-teal-100/70">
              {t("sphereHint", { n: SPHERES.length })}
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-white text-teal-950 hover:bg-teal-50">
              <Link href={marketsHref}>
                {t("ctaMarkets")}
                <ArrowRight className="ms-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10"
            >
              <Link href="/auth/register">{t("ctaStart")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="mx-auto max-w-5xl">
        <h2 className="font-display text-center text-3xl text-slate-900">{t("capsTitle")}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-slate-600">
          {t("capsSub")}
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {caps.map(({ icon: Icon, title, body }) => (
            <div key={title} className="surface p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-800">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-xl text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-4xl">
        <h2 className="font-display text-center text-3xl text-slate-900">{t("howTitle")}</h2>
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {[t("step1"), t("step2"), t("step3")].map((text, i) => (
            <li key={i} className="surface p-5">
              <div className="font-display text-3xl text-teal-800/40">{i + 1}</div>
              <p className="mt-2 text-sm text-slate-700">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Plans strip */}
      <section className="mx-auto max-w-4xl">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="surface p-6">
            <h3 className="font-display text-2xl">{t("freeTitle")}</h3>
            <p className="mt-2 text-sm text-slate-600">{t("freeBody")}</p>
          </div>
          <div className="surface p-6 ring-2 ring-teal-800/25">
            <h3 className="font-display text-2xl">{t("proTitle")}</h3>
            <p className="mt-2 text-sm text-slate-600">{t("proBody")}</p>
            <Button asChild className="mt-4">
              <Link href="/cabinet?tab=keys">{t("proCta")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-3xl text-slate-900">{t("finalTitle")}</h2>
        <p className="mt-2 text-sm text-slate-600">{t("finalSub")}</p>
        <Button asChild size="lg" className="mt-6">
          <Link href={marketsHref}>{t("ctaMarkets")}</Link>
        </Button>
        <p className="mt-4 text-xs text-slate-500">
          {locale === "ru" ? "Локали: RU · EN · 中文 · TR · FA · AR" : "Locales: RU · EN · 中文 · TR · FA · AR"}
        </p>
      </section>
    </div>
  );
}
