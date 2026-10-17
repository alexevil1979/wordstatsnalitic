"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/", key: "dashboard" as const },
  { href: "/research", key: "research" as const },
  { href: "/opportunities", key: "opportunities" as const },
  { href: "/insights", key: "insights" as const },
  { href: "/admin", key: "admin" as const },
  { href: "/settings", key: "settings" as const },
];

export function SiteHeader() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = useLocale();
  const other = locale === "ru" ? "en" : "ru";

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
          </nav>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={pathname} locale={other}>
            {other.toUpperCase()}
          </Link>
        </Button>
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
      </nav>
    </header>
  );
}
