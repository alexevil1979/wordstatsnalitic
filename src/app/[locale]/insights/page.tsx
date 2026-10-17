import { setRequestLocale } from "next-intl/server";
import { InsightsView } from "@/components/insights/insights-view";

export default async function InsightsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <InsightsView />;
}
