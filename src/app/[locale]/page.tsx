import { redirect } from "next/navigation";

/** Home → full market analytics (all niches × major countries). */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/markets`);
}
