import { setRequestLocale } from "next-intl/server";
import { OpportunitiesView } from "@/components/opportunities/opportunities-view";

export default async function OpportunitiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const pick = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  return (
    <OpportunitiesView
      initialFilters={{
        country: pick(sp.country),
        niche: pick(sp.niche),
        category: pick(sp.category),
        competition: pick(sp.competition),
        margin: pick(sp.margin),
        recommendation: pick(sp.recommendation),
        q: pick(sp.q),
      }}
    />
  );
}
