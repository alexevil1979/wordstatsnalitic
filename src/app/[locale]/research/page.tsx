import { setRequestLocale } from "next-intl/server";
import { ResearchView } from "@/components/research/research-view";

export default async function ResearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ResearchView />;
}
