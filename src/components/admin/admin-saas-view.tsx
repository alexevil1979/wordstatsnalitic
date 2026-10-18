"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminView } from "@/components/admin/admin-view";
import { AdminGatewaysView } from "@/components/admin/admin-gateways-view";

type Stats = {
  usersTotal: number;
  proActive: number;
  trendsToday: number;
  mrr: number;
};

type UserRow = {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  plan: string;
  status: string;
  createdAt: string;
};

type PlanRow = {
  id: string;
  name: string;
  priceCents: number;
  priceRub: number;
  dailyResearchCap: number;
  dailyXmlCap: number;
  allowPaidKeys: boolean;
  stripePriceId: string;
};

export function AdminSaasView() {
  const t = useTranslations("adminSaaS");
  const [tab, setTab] = useState<
    "dashboard" | "users" | "plans" | "gateways" | "catalog" | "system"
  >("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [forbidden, setForbidden] = useState(false);

  async function load() {
    const s = await fetch("/api/admin/stats");
    if (s.status === 401 || s.status === 403) {
      setForbidden(true);
      return;
    }
    setStats(await s.json());
    const u = await fetch("/api/admin/users");
    if (u.ok) {
      const json = await u.json();
      setUsers(json.users || []);
    }
    const p = await fetch("/api/admin/plans");
    if (p.ok) {
      const json = await p.json();
      setPlans(json.plans || []);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function userAction(userId: string, action: string) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action }),
    });
    if (!res.ok) {
      toast.error("Failed");
      return;
    }
    toast.success("OK");
    void load();
  }

  async function savePlan(plan: PlanRow) {
    const res = await fetch("/api/admin/plans", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plan),
    });
    if (!res.ok) {
      toast.error("Failed");
      return;
    }
    const json = await res.json();
    setPlans(json.plans || []);
    toast.success(t("planSaved"));
  }

  if (forbidden) {
    return (
      <div className="surface p-6 text-sm text-red-700">
        Admin only. Sign in with an admin account (first registered user becomes admin).
      </div>
    );
  }

  const tabs = [
    ["dashboard", t("dashboard")],
    ["users", t("users")],
    ["plans", t("plans")],
    ["gateways", t("gateways")],
    ["catalog", t("catalog")],
    ["system", t("system")],
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-slate-900">{t("shellTitle")}</h1>
      </div>
      <div className="flex flex-wrap gap-2">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-md px-3 py-1.5 text-sm ${
              tab === id
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label={t("mrr")} value={`$${stats.mrr.toFixed(0)}`} />
          <Kpi label={t("usersTotal")} value={String(stats.usersTotal)} />
          <Kpi label={t("proActive")} value={String(stats.proActive)} />
          <Kpi label={t("trendsToday")} value={String(stats.trendsToday)} />
        </div>
      ) : null}

      {tab === "users" ? (
        <div className="surface overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="p-3">Email</th>
                <th className="p-3">{t("role")}</th>
                <th className="p-3">{t("planCol")}</th>
                <th className="p-3">{t("created")}</th>
                <th className="p-3">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="p-3">
                    {u.email}
                    {u.status !== "active" ? (
                      <span className="ms-2 text-xs text-red-600">{u.status}</span>
                    ) : null}
                  </td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3">{u.plan}</td>
                  <td className="p-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      <Button size="sm" variant="outline" onClick={() => void userAction(u.id, "make_admin")}>
                        {t("makeAdmin")}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => void userAction(u.id, "force_pro")}>
                        {t("setPro")}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => void userAction(u.id, "force_free")}>
                        {t("setFree")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          void userAction(u.id, u.status === "active" ? "disable" : "enable")
                        }
                      >
                        {u.status === "active" ? t("ban") : t("unban")}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "plans" ? (
        <div className="grid gap-4 md:grid-cols-2">
          {plans.map((p) => (
            <div key={p.id} className="surface space-y-3 p-4">
              <h2 className="font-display text-xl">{p.name}</h2>
              <div className="space-y-1.5">
                <Label>{t("priceCents")}</Label>
                <Input
                  type="number"
                  value={p.priceCents}
                  onChange={(e) =>
                    setPlans((all) =>
                      all.map((x) =>
                        x.id === p.id ? { ...x, priceCents: Number(e.target.value) } : x
                      )
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("priceRub")}</Label>
                <Input
                  type="number"
                  value={p.priceRub ?? 0}
                  onChange={(e) =>
                    setPlans((all) =>
                      all.map((x) =>
                        x.id === p.id ? { ...x, priceRub: Number(e.target.value) } : x
                      )
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("dailyResearch")}</Label>
                <Input
                  type="number"
                  value={p.dailyResearchCap}
                  onChange={(e) =>
                    setPlans((all) =>
                      all.map((x) =>
                        x.id === p.id ? { ...x, dailyResearchCap: Number(e.target.value) } : x
                      )
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("dailyXml")}</Label>
                <Input
                  type="number"
                  value={p.dailyXmlCap}
                  onChange={(e) =>
                    setPlans((all) =>
                      all.map((x) =>
                        x.id === p.id ? { ...x, dailyXmlCap: Number(e.target.value) } : x
                      )
                    )
                  }
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={p.allowPaidKeys}
                  onChange={(e) =>
                    setPlans((all) =>
                      all.map((x) =>
                        x.id === p.id ? { ...x, allowPaidKeys: e.target.checked } : x
                      )
                    )
                  }
                />
                {t("allowPaidKeys")}
              </label>
              <div className="space-y-1.5">
                <Label>Stripe Price ID</Label>
                <Input
                  value={p.stripePriceId}
                  onChange={(e) =>
                    setPlans((all) =>
                      all.map((x) =>
                        x.id === p.id ? { ...x, stripePriceId: e.target.value } : x
                      )
                    )
                  }
                />
              </div>
              <Button onClick={() => void savePlan(p)}>{t("savePlan")}</Button>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "gateways" ? <AdminGatewaysView /> : null}

      {tab === "catalog" ? <AdminView /> : null}

      {tab === "system" ? (
        <div className="surface space-y-2 p-4 text-sm text-slate-700">
          <p>DB: SQLite (WAL) — Postgres docker ready for cutover</p>
          <p>Redis: available on VPS for rate-limit upgrade</p>
          <p>
            Payments: same gateways as fullvpnservice — configure in Admin → Gateways (YooKassa,
            FreeKassa, Platega, FriendlyPay, NOWPayments, BetaTransfer, Stripe, PayPal, …)
          </p>
          <p>Optional env: STRIPE_SECRET_KEY, STRIPE_PRICE_PRO, STRIPE_WEBHOOK_SECRET, USD_RUB_RATE</p>
          <p>Auth: AUTH_SECRET, APP_URL, CREDENTIALS_ENCRYPTION_KEY</p>
        </div>
      ) : null}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}
