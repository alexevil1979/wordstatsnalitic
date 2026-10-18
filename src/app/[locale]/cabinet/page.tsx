import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { CabinetView } from "@/components/cabinet/cabinet-view";

export default async function CabinetPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense fallback={<div>…</div>}>
      <CabinetView />
    </Suspense>
  );
}
