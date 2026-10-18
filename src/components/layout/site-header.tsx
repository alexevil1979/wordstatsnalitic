"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { locales, localeLabels, type AppLocale } from "@/i18n/routing";

const links = [
  { href: "/", key: "product" as const },
  { href: "/markets", key: "markets" as const },
  { href: "/opportunities", key: "opportunities" as const },
  { href: "/insights", key: "insights" as const },
  { href: "/research", key: "research" as const },
  { href: "/cabinet", key: "cabinet" as const },
];

export function SiteHeader() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = useLocale() as AppLocale;
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="group">
            <div className="font-display text-xl tracking-tight text-slate-900">
              {t("brand.name")}
            </div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-teal-800/80">
              {t("brand.tagline")}
            </div>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const active =
                l.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-teal-50 font-medium text-teal-900"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  {t(`nav.${l.key}`)}
                </Link>
              );
            })}
            {isAdmin ? (
              <Link
                href="/admin"
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  pathname.startsWith("/admin")
                    ? "bg-teal-50 font-medium text-teal-900"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                {t("nav.admin")}
              </Link>
            ) : null}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="locale-switch">
            Language
          </label>
          <select
            id="locale-switch"
            className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700"
            value={locale}
            onChange={(e) => {
              const next = e.target.value as AppLocale;
              window.location.href = `/${next}${pathname === "/" ? "" : pathname}`;
            }}
          >
            {locales.map((code) => (
              <option key={code} value={code}>
                {localeLabels[code]}
              </option>
            ))}
          </select>
          {session?.user ? (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href="/cabinet">{t("nav.cabinet")}</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: `/${locale}/markets` })}
              >
                {t("nav.logout")}
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/login">{t("nav.login")}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/register">{t("nav.register")}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="whitespace-nowrap rounded-md px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100"
          >
            {t(`nav.${l.key}`)}
          </Link>
        ))}
        {isAdmin ? (
          <Link
            href="/admin"
            className="whitespace-nowrap rounded-md px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100"
          >
            {t("nav.admin")}
          </Link>
        ) : null}
      </nav>
    </header>
  );
}
