import { setRequestLocale } from "next-intl/server";
import { AdminView } from "@/components/admin/admin-view";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AdminView />;
}
