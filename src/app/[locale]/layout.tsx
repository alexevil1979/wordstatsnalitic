import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Fraunces, Noto_Sans_Arabic, Noto_Sans_SC, Source_Sans_3 } from "next/font/google";
import { notFound } from "next/navigation";
import { Toaster } from "sonner";
import { SiteHeader } from "@/components/layout/site-header";
import { SessionProvider } from "@/components/providers/session-provider";
import { isAppLocale, isRtlLocale, routing } from "@/i18n/routing";
import { auth } from "@/auth";
import "../globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin", "cyrillic", "latin-ext"],
  variable: "--font-source-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const notoSc = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sc",
});

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-arabic",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  const session = await auth();
  const rtl = isRtlLocale(locale);
  const fontClass = [
    sourceSans.variable,
    fraunces.variable,
    locale === "zh" ? notoSc.variable : "",
    rtl ? notoArabic.variable : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <html lang={locale} dir={rtl ? "rtl" : "ltr"}>
      <body
        className={`${fontClass} antialiased ${
          locale === "zh" ? "font-cjk" : rtl ? "font-arabic" : ""
        }`}
      >
        <SessionProvider session={session}>
          <NextIntlClientProvider messages={messages}>
            <SiteHeader />
            <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">{children}</main>
            <Toaster richColors position={rtl ? "top-left" : "top-right"} />
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
