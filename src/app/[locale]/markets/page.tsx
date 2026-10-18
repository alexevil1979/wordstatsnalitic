import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { MarketsView } from "@/components/markets/markets-view";

export default async function MarketsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense fallback={<div className="py-16 text-center text-slate-500">…</div>}>
      <MarketsView />
    </Suspense>
  );
}
