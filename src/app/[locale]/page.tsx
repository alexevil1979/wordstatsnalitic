import { setRequestLocale } from "next-intl/server";
import { LandingView } from "@/components/landing/landing-view";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LandingView />;
}
