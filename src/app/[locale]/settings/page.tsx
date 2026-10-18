import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { SettingsView } from "@/components/settings/settings-view";

/**
 * Platform worker settings (admin). Regular users configure their own provider
 * keys in the Cabinet — Wordstat is the tool, keys stay with the user.
 */
export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/auth/login`);
  if (session.user.role !== "admin") {
    redirect(`/${locale}/cabinet?tab=keys`);
  }
  return <SettingsView />;
}
