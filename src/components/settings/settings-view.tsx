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

type PublicSettings = {
  KEYWORD_PROVIDER: string;
  TRENDS_CACHE_TTL_HOURS: string;
  TRENDS_PYTHON: string;
  hasSerpApiKey: boolean;
  hasDataForSeo: boolean;
  hasAhrefs: boolean;
};

export function SettingsView() {
  const t = useTranslations("settings");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [provider, setProvider] = useState("google_trends");
  const [ttl, setTtl] = useState("24");
  const [python, setPython] = useState("");
  const [serp, setSerp] = useState("");
  const [dfsLogin, setDfsLogin] = useState("");
  const [dfsPass, setDfsPass] = useState("");
  const [ahrefs, setAhrefs] = useState("");
  const [flags, setFlags] = useState({ serp: false, dfs: false, ahrefs: false });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((j) => {
        const d = j.data as PublicSettings;
        setProvider(d.KEYWORD_PROVIDER || "google_trends");
        setTtl(d.TRENDS_CACHE_TTL_HOURS || "24");
        setPython(d.TRENDS_PYTHON || "");
        setFlags({
          serp: d.hasSerpApiKey,
          dfs: d.hasDataForSeo,
          ahrefs: d.hasAhrefs,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const body: Record<string, string> = {
        KEYWORD_PROVIDER: provider,
        TRENDS_CACHE_TTL_HOURS: ttl,
        TRENDS_PYTHON: python,
      };
      if (serp) body.SERPAPI_KEY = serp;
      if (dfsLogin) body.DATAFORSEO_LOGIN = dfsLogin;
      if (dfsPass) body.DATAFORSEO_PASSWORD = dfsPass;
      if (ahrefs) body.AHREFS_API_TOKEN = ahrefs;

      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      const d = json.data as PublicSettings;
      setFlags({
        serp: d.hasSerpApiKey,
        dfs: d.hasDataForSeo,
        ahrefs: d.hasAhrefs,
      });
      setSerp("");
      setDfsPass("");
      setAhrefs("");
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
        <p className="mt-2 text-sm text-slate-600">{t("subtitle")}</p>
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
              <SelectItem value="serpapi">{t("providers.serpapi")}</SelectItem>
              <SelectItem value="dataforseo">{t("providers.dataforseo")}</SelectItem>
              <SelectItem value="ahrefs">{t("providers.ahrefs")}</SelectItem>
              <SelectItem value="expert_seed">{t("providers.expert_seed")}</SelectItem>
            </SelectContent>
          </Select>
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

        <div className="border-t border-slate-100 pt-4 space-y-4">
          <h2 className="font-display text-lg text-slate-900">{t("keys")}</h2>
          <p className="text-xs text-slate-500">{t("keysHint")}</p>

          <Field
            label={`SerpAPI ${flags.serp ? t("configured") : ""}`}
            value={serp}
            onChange={setSerp}
            placeholder={flags.serp ? "••••••••" : "SERPAPI_KEY"}
            type="password"
          />
          <Field
            label={`DataForSEO login ${flags.dfs ? t("configured") : ""}`}
            value={dfsLogin}
            onChange={setDfsLogin}
            placeholder="login"
          />
          <Field
            label="DataForSEO password"
            value={dfsPass}
            onChange={setDfsPass}
            placeholder={flags.dfs ? "••••••••" : "password"}
            type="password"
          />
          <Field
            label={`Ahrefs ${flags.ahrefs ? t("configured") : ""}`}
            value={ahrefs}
            onChange={setAhrefs}
            placeholder={flags.ahrefs ? "••••••••" : "AHREFS_API_TOKEN"}
            type="password"
          />
        </div>

        <Button onClick={save} disabled={saving}>
          {saving ? t("saving") : t("save")}
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  );
}
