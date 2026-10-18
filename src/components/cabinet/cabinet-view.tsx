"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { locales, localeLabels, type AppLocale } from "@/i18n/routing";

type MeResponse = {
  user: { email: string; name?: string | null; plan: string; locale: string; role: string };
  plan: {
    id: string;
    name: string;
    priceCents: number;
    dailyResearchCap: number;
    dailyXmlCap: number;
    allowPaidKeys: boolean;
  };
  subscription: { status: string; currentPeriodEnd?: string | null } | null;
  usage: { research: number; xml_export: number };
  keys: Record<string, { configured: boolean; hint: string }>;
  history: Array<{
    id: string;
    query: string;
    country: string;
    provider: string;
    status: string;
    avgInterest?: number | null;
    createdAt: string;
  }>;
  stripeConfigured: boolean;
};

type PayMethod = { code: string; name: string; testMode: boolean };

export function CabinetView() {
  const t = useTranslations("cabinet");
  const tb = useTranslations("billing");
  const locale = useLocale();
  const sp = useSearchParams();
  const [data, setData] = useState<MeResponse | null>(null);
  const [methods, setMethods] = useState<PayMethod[]>([]);
  const [amountRub, setAmountRub] = useState(2490);
  const [gateway, setGateway] = useState("");
  const initialTab = (sp.get("tab") as
    | "overview"
    | "keys"
    | "history"
    | "billing"
    | "profile"
    | null) || "keys";
  const [tab, setTab] = useState<
    "overview" | "keys" | "history" | "billing" | "profile"
  >(
    ["overview", "keys", "history", "billing", "profile"].includes(initialTab)
      ? initialTab
      : "keys"
  );
  const [keys, setKeys] = useState({
    serpapi: "",
    dataforseo_login: "",
    dataforseo_password: "",
    ahrefs: "",
  });
  const [profile, setProfile] = useState({ name: "", locale: locale, password: "" });

  async function load() {
    const res = await fetch("/api/cabinet/me");
    if (!res.ok) {
      window.location.href = `/${locale}/auth/login`;
      return;
    }
    const json = (await res.json()) as MeResponse;
    setData(json);
    setProfile({
      name: json.user.name || "",
      locale: json.user.locale || locale,
      password: "",
    });
    const m = await fetch(`/api/billing/methods?locale=${locale}`);
    if (m.ok) {
      const mj = await m.json();
      setMethods(mj.methods || []);
      setAmountRub(mj.amountRub || 2490);
      if (mj.methods?.[0] && !gateway) setGateway(mj.methods[0].code);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const billing = sp.get("billing");
    if (billing === "success") toast.success(tb("success"));
    if (billing === "cancel") toast.message(tb("cancel"));
  }, [sp, tb]);

  async function saveKeys() {
    const res = await fetch("/api/cabinet/keys", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(keys),
    });
    if (res.status === 402) {
      toast.error(t("proOnly"));
      return;
    }
    if (!res.ok) {
      toast.error(t("proOnly"));
      return;
    }
    toast.success(t("keysSaved"));
    setKeys({ serpapi: "", dataforseo_login: "", dataforseo_password: "", ahrefs: "" });
    void load();
  }

  async function saveProfile() {
    const res = await fetch("/api/cabinet/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: profile.name,
        locale: profile.locale,
        password: profile.password || undefined,
      }),
    });
    if (!res.ok) {
      toast.error("Error");
      return;
    }
    toast.success(t("profileSaved"));
    if (profile.locale !== locale) {
      window.location.href = `/${profile.locale}/cabinet`;
      return;
    }
    void load();
  }

  async function checkout() {
    if (!gateway) {
      toast.error(tb("pickMethod"));
      return;
    }
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale, gateway }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.message || tb("payFailed"));
      return;
    }
    if (json.url) window.location.href = json.url;
  }

  async function portal() {
    const res = await fetch("/api/billing/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(tb("stripeMissing"));
      return;
    }
    if (json.url) window.location.href = json.url;
  }

  if (!data) {
    return <div className="text-sm text-slate-600">…</div>;
  }

  const tabs = [
    ["overview", t("overview")],
    ["keys", t("keys")],
    ["history", t("history")],
    ["billing", t("billing")],
    ["profile", t("profile")],
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-slate-900">{t("title")}</h1>
        <p className="mt-1 text-slate-600">{t("subtitle")}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-md px-3 py-1.5 text-sm ${
              tab === id
                ? "bg-teal-800 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="surface p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500">{t("plan")}</div>
            <div className="mt-1 text-2xl font-semibold">{data.user.plan.toUpperCase()}</div>
            <div className="mt-2 text-sm text-slate-600">{t("freeHint")}</div>
            <Button className="mt-3" size="sm" variant="outline" onClick={() => setTab("keys")}>
              {t("keys")}
            </Button>
          </div>
          <div className="surface p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500">{t("usageToday")}</div>
            <div className="mt-2 text-sm">
              {t("research")}: {data.usage.research}/{data.plan.dailyResearchCap}
            </div>
            <div className="text-sm">
              {t("xmlExport")}: {data.usage.xml_export}/{data.plan.dailyXmlCap}
            </div>
          </div>
          <div className="surface p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500">{t("status")}</div>
            <div className="mt-1 text-lg">
              {data.subscription?.status || t("notSubscribed")}
            </div>
            {data.subscription?.currentPeriodEnd ? (
              <div className="mt-1 text-sm text-slate-600">
                {t("periodEnd")}:{" "}
                {new Date(data.subscription.currentPeriodEnd).toLocaleDateString(locale)}
              </div>
            ) : null}
            {data.user.plan !== "pro" ? (
              <Button className="mt-3" size="sm" onClick={() => void checkout()}>
                {t("upgrade")}
              </Button>
            ) : (
              <Button className="mt-3" size="sm" variant="outline" onClick={() => void portal()}>
                {t("manageBilling")}
              </Button>
            )}
          </div>
        </div>
      ) : null}

      {tab === "keys" ? (
        <div className="max-w-xl space-y-4">
          <div className="surface space-y-3 p-4">
            <h2 className="font-display text-xl text-slate-900">{t("keysTitle")}</h2>
            <p className="text-sm text-slate-700">{t("byokLead")}</p>
            <ul className="list-disc space-y-1 ps-5 text-sm text-slate-600">
              <li>{t("byokBullet1")}</li>
              <li>{t("byokBullet2")}</li>
              <li>{t("byokBullet3")}</li>
            </ul>
          </div>

          <div className="surface space-y-4 p-4">
            {!data.plan.allowPaidKeys ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                <p>{t("proOnly")}</p>
                <Button className="mt-2" size="sm" onClick={() => setTab("billing")}>
                  {t("upgrade")}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-slate-600">{t("keysHint")}</p>
            )}
            {(
              [
                ["serpapi", t("serpapi"), t("serpapiHelp")],
                ["dataforseo_login", t("dataforseoLogin"), t("dataforseoHelp")],
                ["dataforseo_password", t("dataforseoPassword"), ""],
                ["ahrefs", t("ahrefs"), t("ahrefsHelp")],
              ] as const
            ).map(([key, label, help]) => (
              <div key={key} className="space-y-1.5">
                <Label>
                  {label}{" "}
                  {data.keys[key]?.configured ? (
                    <span className="text-teal-700">{t("configured")}</span>
                  ) : null}
                </Label>
                <Input
                  type="password"
                  value={keys[key]}
                  disabled={!data.plan.allowPaidKeys}
                  placeholder={data.keys[key]?.hint || t("pasteOwnKey")}
                  onChange={(e) => setKeys((s) => ({ ...s, [key]: e.target.value }))}
                  autoComplete="off"
                />
                {help ? <p className="text-xs text-slate-500">{help}</p> : null}
              </div>
            ))}
            <Button onClick={() => void saveKeys()} disabled={!data.plan.allowPaidKeys}>
              {t("saveKeys")}
            </Button>
          </div>
        </div>
      ) : null}

      {tab === "history" ? (
        <div className="surface overflow-x-auto p-2">
          {data.history.length === 0 ? (
            <p className="p-4 text-sm text-slate-600">{t("noHistory")}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="p-2">Query</th>
                  <th className="p-2">Country</th>
                  <th className="p-2">Avg</th>
                  <th className="p-2">When</th>
                </tr>
              </thead>
              <tbody>
                {data.history.map((h) => (
                  <tr key={h.id} className="border-t border-slate-100">
                    <td className="p-2">{h.query}</td>
                    <td className="p-2">{h.country}</td>
                    <td className="p-2">{h.avgInterest ?? "—"}</td>
                    <td className="p-2">{new Date(h.createdAt).toLocaleString(locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : null}

      {tab === "billing" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="surface p-4">
            <h2 className="font-display text-xl">{tb("free")}</h2>
            <p className="mt-2 text-sm text-slate-600">{tb("freeFeatures")}</p>
          </div>
          <div className="surface p-4 ring-2 ring-teal-700/30">
            <h2 className="font-display text-xl">
              {tb("pro")} · {amountRub} ₽ / ${(data.plan.priceCents / 100).toFixed(0)}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{tb("proFeatures")}</p>
            {methods.length === 0 ? (
              <p className="mt-3 text-sm text-amber-800">{tb("noMethods")}</p>
            ) : (
              <div className="mt-4 space-y-2">
                <Label>{tb("payMethod")}</Label>
                <div className="grid gap-2">
                  {methods.map((m) => (
                    <label
                      key={m.code}
                      className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                        gateway === m.code
                          ? "border-teal-700 bg-teal-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="gateway"
                        checked={gateway === m.code}
                        onChange={() => setGateway(m.code)}
                      />
                      <span>{m.name}</span>
                      {m.testMode ? (
                        <span className="ms-auto text-[10px] uppercase text-amber-700">test</span>
                      ) : null}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4 flex gap-2">
              <Button onClick={() => void checkout()} disabled={!gateway}>
                {tb("checkout")}
              </Button>
              {data.stripeConfigured ? (
                <Button variant="outline" onClick={() => void portal()}>
                  {tb("portal")}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {tab === "profile" ? (
        <div className="surface max-w-md space-y-4 p-4">
          <div className="space-y-1.5">
            <Label>{t("locale")}</Label>
            <select
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
              value={profile.locale}
              onChange={(e) => setProfile((s) => ({ ...s, locale: e.target.value }))}
            >
              {locales.map((code) => (
                <option key={code} value={code}>
                  {localeLabels[code as AppLocale]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={data.user.email} disabled />
          </div>
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              value={profile.name}
              onChange={(e) => setProfile((s) => ({ ...s, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("changePassword")}</Label>
            <Input
              type="password"
              value={profile.password}
              onChange={(e) => setProfile((s) => ({ ...s, password: e.target.value }))}
            />
          </div>
          <Button onClick={() => void saveProfile()}>{t("saveProfile")}</Button>
        </div>
      ) : null}
    </div>
  );
}
