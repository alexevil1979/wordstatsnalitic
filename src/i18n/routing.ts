import { defineRouting } from "next-intl/routing";

/** Same locales as hiddifysales.com */
export const locales = ["ru", "en", "zh", "tr", "fa", "ar"] as const;
export type AppLocale = (typeof locales)[number];

export const rtlLocales: readonly AppLocale[] = ["ar", "fa"];

export function isAppLocale(value: string): value is AppLocale {
  return (locales as readonly string[]).includes(value);
}

export function isRtlLocale(locale: string): boolean {
  return (rtlLocales as readonly string[]).includes(locale);
}

export const localeLabels: Record<AppLocale, string> = {
  ru: "RU",
  en: "EN",
  zh: "中文",
  tr: "TR",
  fa: "FA",
  ar: "AR",
};

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale: "ru",
  localePrefix: "always",
});
