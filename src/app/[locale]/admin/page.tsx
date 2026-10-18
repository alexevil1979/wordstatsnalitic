import { setRequestLocale } from "next-intl/server";
import { AdminSaasView } from "@/components/admin/admin-saas-view";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AdminSaasView />;
}
