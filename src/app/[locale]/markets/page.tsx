import { setRequestLocale } from "next-intl/server";
import { MarketsView } from "@/components/markets/markets-view";

export default async function MarketsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MarketsView />;
}
