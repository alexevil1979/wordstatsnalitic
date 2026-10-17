"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import { RecommendationBadge } from "@/components/status-badges";
import type { KeywordOpportunity } from "@/lib/types";

type Meta = {
  countries: Array<{ code: string; nameRu: string; nameEn: string }>;
  niches: Array<{ id: string; nameRu: string; nameEn: string }>;
};

type FormState = {
  countryCode: string;
  nicheId: string;
  queryCluster: string;
  searchVolume: string;
  trend: string;
  competition: string;
  commercialIntent: string;
  marginPotential: string;
  entryDifficulty: string;
  recommendation: string;
  exampleOffer: string;
  exampleOfferRu: string;
  priceRange: string;
};

const blank = (meta?: Meta | null): FormState => ({
  countryCode: meta?.countries[0]?.code ?? "US",
  nicheId: meta?.niches[0]?.id ?? "ai-agents",
  queryCluster: "",
  searchVolume: "1000",
  trend: "growing",
  competition: "medium",
  commercialIntent: "high",
  marginPotential: "high",
  entryDifficulty: "medium",
  recommendation: "test",
  exampleOffer: "",
  exampleOfferRu: "",
  priceRange: "$1,000–$5,000",
});

export function AdminView() {
  const t = useTranslations("admin");
  const te = useTranslations("enums");
  const locale = useLocale();
  const [meta, setMeta] = useState<Meta | null>(null);
  const [rows, setRows] = useState<KeywordOpportunity[]>([]);
  const [form, setForm] = useState<FormState>(blank());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    const [m, o] = await Promise.all([
      fetch("/api/meta").then((r) => r.json()),
      fetch("/api/opportunities?sort=updatedAt&order=desc").then((r) => r.json()),
    ]);
    setMeta(m.data);
    setRows(o.data ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function startCreate() {
    setEditingId(null);
    setForm(blank(meta));
    setOpen(true);
  }

  function startEdit(row: KeywordOpportunity) {
    setEditingId(row.id);
    setForm({
      countryCode: row.countryCode,
      nicheId: row.nicheId,
      queryCluster: row.queryCluster,
      searchVolume: String(row.searchVolume),
      trend: row.trend,
      competition: row.competition,
      commercialIntent: row.commercialIntent,
      marginPotential: row.marginPotential,
      entryDifficulty: row.entryDifficulty,
      recommendation: row.recommendation,
      exampleOffer: row.exampleOffer,
      exampleOfferRu: row.exampleOfferRu,
      priceRange: row.priceRange,
    });
    setOpen(true);
  }

  async function save() {
    const payload = {
      ...form,
      searchVolume: Number(form.searchVolume),
    };
    const res = await fetch(
      editingId ? `/api/opportunities/${editingId}` : "/api/opportunities",
      {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error ?? "Error");
      return;
    }
    toast.success(editingId ? t("updated") : t("created"));
    setOpen(false);
    await load();
  }

  async function remove(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    const res = await fetch(`/api/opportunities/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Error");
      return;
    }
    toast.success(t("deleted"));
    await load();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-slate-900">
            {t("title")}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">{t("subtitle")}</p>
        </div>
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4" />
          {t("add")}
        </Button>
      </div>

      {open && (
        <div className="surface space-y-4 p-4 md:p-5">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Field label={t("form.query")} className="lg:col-span-2">
              <Input
                value={form.queryCluster}
                onChange={(e) =>
                  setForm((f) => ({ ...f, queryCluster: e.target.value }))
                }
              />
            </Field>
            <Field label={t("form.volume")}>
              <Input
                type="number"
                value={form.searchVolume}
                onChange={(e) =>
                  setForm((f) => ({ ...f, searchVolume: e.target.value }))
                }
              />
            </Field>
            <Field label={t("form.country")}>
              <Select
                value={form.countryCode}
                onValueChange={(v) => setForm((f) => ({ ...f, countryCode: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {meta?.countries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {locale === "ru" ? c.nameRu : c.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("form.niche")}>
              <Select
                value={form.nicheId}
                onValueChange={(v) => setForm((f) => ({ ...f, nicheId: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {meta?.niches.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {locale === "ru" ? n.nameRu : n.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <EnumField
              label={t("form.trend")}
              value={form.trend}
              onChange={(v) => setForm((f) => ({ ...f, trend: v }))}
              options={["growing", "stable", "declining"]}
              labels={te.raw("trend") as Record<string, string>}
            />
            <EnumField
              label={t("form.competition")}
              value={form.competition}
              onChange={(v) => setForm((f) => ({ ...f, competition: v }))}
              options={["low", "medium", "high"]}
              labels={te.raw("competition") as Record<string, string>}
            />
            <EnumField
              label={t("form.intent")}
              value={form.commercialIntent}
              onChange={(v) => setForm((f) => ({ ...f, commercialIntent: v }))}
              options={["high", "medium"]}
              labels={te.raw("level") as Record<string, string>}
            />
            <EnumField
              label={t("form.margin")}
              value={form.marginPotential}
              onChange={(v) => setForm((f) => ({ ...f, marginPotential: v }))}
              options={["high", "medium"]}
              labels={te.raw("level") as Record<string, string>}
            />
            <EnumField
              label={t("form.entry")}
              value={form.entryDifficulty}
              onChange={(v) => setForm((f) => ({ ...f, entryDifficulty: v }))}
              options={["low", "medium", "high"]}
              labels={te.raw("entry") as Record<string, string>}
            />
            <EnumField
              label={t("form.recommendation")}
              value={form.recommendation}
              onChange={(v) => setForm((f) => ({ ...f, recommendation: v }))}
              options={["launch", "test", "not_now"]}
              labels={te.raw("recommendation") as Record<string, string>}
            />
            <Field label={t("form.offerEn")} className="lg:col-span-2">
              <Input
                value={form.exampleOffer}
                onChange={(e) =>
                  setForm((f) => ({ ...f, exampleOffer: e.target.value }))
                }
              />
            </Field>
            <Field label={t("form.offerRu")} className="lg:col-span-2">
              <Input
                value={form.exampleOfferRu}
                onChange={(e) =>
                  setForm((f) => ({ ...f, exampleOfferRu: e.target.value }))
                }
              />
            </Field>
            <Field label={t("form.price")}>
              <Input
                value={form.priceRange}
                onChange={(e) =>
                  setForm((f) => ({ ...f, priceRange: e.target.value }))
                }
              />
            </Field>
          </div>
          <div className="flex gap-2">
            <Button onClick={save}>{t("save")}</Button>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
          </div>
        </div>
      )}

      <div className="table-wrap max-h-[65vh]">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t("form.query")}</th>
              <th>{t("form.country")}</th>
              <th>{t("form.recommendation")}</th>
              <th>{t("form.volume")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="max-w-xs">
                  <div className="font-medium">{row.queryCluster}</div>
                  <div className="text-[11px] text-slate-500">
                    {locale === "ru" ? row.nicheNameRu : row.nicheNameEn}
                  </div>
                </td>
                <td>
                  {locale === "ru" ? row.countryNameRu : row.countryNameEn}
                </td>
                <td>
                  <RecommendationBadge value={row.recommendation} />
                </td>
                <td className="tabular-nums">{row.searchVolume}</td>
                <td>
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => startEdit(row)}
                      aria-label={t("edit")}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => remove(row.id)}
                      aria-label={t("delete")}
                    >
                      <Trash2 className="h-4 w-4 text-rose-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function EnumField({
  label,
  value,
  onChange,
  options,
  labels,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labels: Record<string, string>;
}) {
  return (
    <Field label={label}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {labels[o] ?? o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
