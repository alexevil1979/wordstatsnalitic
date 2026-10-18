import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { AdminSaasView } from "@/components/admin/admin-saas-view";
import { auth } from "@/auth";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/auth/login`);
  if (session.user.role !== "admin") redirect(`/${locale}/cabinet`);
  return <AdminSaasView />;
}
