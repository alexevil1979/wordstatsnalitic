"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "@/i18n/navigation";

type PublicSettings = {
  KEYWORD_PROVIDER: string;
  TRENDS_CACHE_TTL_HOURS: string;
  TRENDS_PYTHON: string;
};

/** Admin-only: catalog refresh worker. User BYOK keys → Cabinet. */
export function SettingsView() {
  const t = useTranslations("settings");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [provider, setProvider] = useState("google_trends");
  const [ttl, setTtl] = useState("24");
  const [python, setPython] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((j) => {
        const d = j.data as PublicSettings;
        setProvider(d.KEYWORD_PROVIDER || "google_trends");
        setTtl(d.TRENDS_CACHE_TTL_HOURS || "24");
        setPython(d.TRENDS_PYTHON || "");
      })
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          KEYWORD_PROVIDER: provider,
          TRENDS_CACHE_TTL_HOURS: ttl,
          TRENDS_PYTHON: python,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      toast.success(t("saved"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("error"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="py-16 text-center text-slate-500">…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-slate-900">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-slate-600">{t("subtitleAdmin")}</p>
        <p className="mt-2 text-sm text-teal-900">
          {t("byokNote")}{" "}
          <Link href="/cabinet?tab=keys" className="underline underline-offset-2">
            {t("toCabinetKeys")}
          </Link>
        </p>
      </div>

      <div className="surface space-y-5 p-5">
        <div className="space-y-1.5">
          <Label>{t("provider")}</Label>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="google_trends">{t("providers.google_trends")}</SelectItem>
              <SelectItem value="expert_seed">{t("providers.expert_seed")}</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500">{t("providerCatalogHint")}</p>
        </div>

        <div className="space-y-1.5">
          <Label>{t("ttl")}</Label>
          <Input value={ttl} onChange={(e) => setTtl(e.target.value)} type="number" min={1} />
        </div>

        <div className="space-y-1.5">
          <Label>{t("python")}</Label>
          <Input
            value={python}
            onChange={(e) => setPython(e.target.value)}
            placeholder=".venv/bin/python"
          />
          <p className="text-xs text-slate-500">{t("pythonHint")}</p>
        </div>

        <Button onClick={() => void save()} disabled={saving}>
          {saving ? t("saving") : t("save")}
        </Button>
      </div>
    </div>
  );
}
