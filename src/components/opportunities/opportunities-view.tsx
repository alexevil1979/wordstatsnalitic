"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";
import { Download, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CompetitionBadge,
  EntryBadge,
  LevelBadge,
  RecommendationBadge,
  TrendBadge,
} from "@/components/status-badges";
import { downloadCsv, downloadExcel } from "@/lib/export";
import { formatVolume } from "@/lib/utils";
import type { KeywordOpportunity } from "@/lib/types";

type Meta = {
  countries: Array<{ code: string; nameRu: string; nameEn: string }>;
  niches: Array<{ id: string; nameRu: string; nameEn: string; category: string }>;
};

type Filters = {
  country: string;
  niche: string;
  category: string;
  competition: string;
  margin: string;
  recommendation: string;
  q: string;
};

const emptyFilters: Filters = {
  country: "all",
  niche: "all",
  category: "all",
  competition: "all",
  margin: "all",
  recommendation: "all",
  q: "",
};

export function OpportunitiesView({
  initialFilters,
}: {
  initialFilters?: Partial<Filters>;
}) {
  const t = useTranslations("opportunities");
  const te = useTranslations("enums");
  const locale = useLocale();
  const [meta, setMeta] = useState<Meta | null>(null);
  const [data, setData] = useState<KeywordOpportunity[]>([]);
  const [filters, setFilters] = useState<Filters>(() => {
    const next = { ...emptyFilters };
    if (!initialFilters) return next;
    for (const key of Object.keys(emptyFilters) as (keyof Filters)[]) {
      const val = initialFilters[key];
      if (val) next[key] = val;
    }
    return next;
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "opportunityScore", desc: true },
  ]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/meta")
      .then((r) => r.json())
      .then((j) => setMeta(j.data));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const sp = new URLSearchParams();
    if (filters.country !== "all") sp.set("country", filters.country);
    if (filters.niche !== "all") sp.set("niche", filters.niche);
    if (filters.category !== "all") sp.set("category", filters.category);
    if (filters.competition !== "all") sp.set("competition", filters.competition);
    if (filters.margin !== "all") sp.set("margin", filters.margin);
    if (filters.recommendation !== "all")
      sp.set("recommendation", filters.recommendation);
    if (filters.q) sp.set("q", filters.q);
    const res = await fetch(`/api/opportunities?${sp.toString()}`);
    const json = await res.json();
    setData(json.data ?? []);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    const id = setTimeout(load, 150);
    return () => clearTimeout(id);
  }, [load]);

  const columns = useMemo<ColumnDef<KeywordOpportunity>[]>(
    () => [
      {
        id: "expand",
        header: "",
        cell: ({ row }) =>
          expanded === row.original.id ? (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          ),
        enableSorting: false,
      },
      {
        accessorKey: "queryCluster",
        header: t("columns.query"),
        cell: ({ row }) => (
          <div className="min-w-[200px]">
            <div className="font-medium text-slate-900">{row.original.queryCluster}</div>
            <div className="mt-0.5 text-[11px] text-slate-500">
              {locale === "ru"
                ? row.original.countryNameRu
                : row.original.countryNameEn}{" "}
              ·{" "}
              {locale === "ru" ? row.original.nicheNameRu : row.original.nicheNameEn}
              {" · "}
              <span className="rounded bg-slate-100 px-1 py-0.5 font-medium text-slate-600">
                {row.original.source}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "searchVolume",
        header: t("columns.volume"),
        cell: ({ getValue }) => (
          <span className="tabular-nums">{formatVolume(getValue<number>(), locale)}</span>
        ),
      },
      {
        accessorKey: "trend",
        header: t("columns.trend"),
        cell: ({ getValue }) => <TrendBadge value={getValue<"growing">()} />,
      },
      {
        accessorKey: "competition",
        header: t("columns.competition"),
        cell: ({ getValue }) => <CompetitionBadge value={getValue<"low">()} />,
      },
      {
        accessorKey: "commercialIntent",
        header: t("columns.intent"),
        cell: ({ getValue }) => <LevelBadge value={getValue<"high">()} />,
      },
      {
        accessorKey: "marginPotential",
        header: t("columns.margin"),
        cell: ({ getValue }) => <LevelBadge value={getValue<"high">()} />,
      },
      {
        accessorKey: "entryDifficulty",
        header: t("columns.entry"),
        cell: ({ getValue }) => <EntryBadge value={getValue<"low">()} />,
      },
      {
        accessorKey: "recommendation",
        header: t("columns.recommendation"),
        cell: ({ getValue }) => <RecommendationBadge value={getValue<"launch">()} />,
      },
      {
        accessorKey: "opportunityScore",
        header: t("columns.score"),
        cell: ({ getValue }) => (
          <span className="font-semibold tabular-nums text-teal-800">
            {getValue<number>()}
          </span>
        ),
      },
    ],
    [expanded, locale, t]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-slate-900">
            {t("title")}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            {t("results", { count: data.length })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadCsv(data, locale, "wordstat-opportunities.csv")}
          >
            <Download className="h-3.5 w-3.5" />
            {t("exportCsv")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadExcel(data, locale, "wordstat-opportunities.xlsx")}
          >
            <Download className="h-3.5 w-3.5" />
            {t("exportExcel")}
          </Button>
        </div>
      </div>

      <div className="surface grid gap-3 p-4 md:grid-cols-3 lg:grid-cols-7">
        <Input
          className="lg:col-span-2"
          placeholder={t("search")}
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
        />
        <FilterSelect
          label={t("country")}
          value={filters.country}
          onChange={(v) => setFilters((f) => ({ ...f, country: v }))}
          options={[
            { value: "all", label: t("all") },
            ...(meta?.countries.map((c) => ({
              value: c.code,
              label: locale === "ru" ? c.nameRu : c.nameEn,
            })) ?? []),
          ]}
        />
        <FilterSelect
          label={t("niche")}
          value={filters.niche}
          onChange={(v) => setFilters((f) => ({ ...f, niche: v }))}
          options={[
            { value: "all", label: t("all") },
            ...(meta?.niches.map((n) => ({
              value: n.id,
              label: locale === "ru" ? n.nameRu : n.nameEn,
            })) ?? []),
          ]}
        />
        <FilterSelect
          label={t("category")}
          value={filters.category}
          onChange={(v) => setFilters((f) => ({ ...f, category: v }))}
          options={[
            { value: "all", label: t("all") },
            { value: "it_services", label: te("category.it_services") },
            { value: "digital_products", label: te("category.digital_products") },
          ]}
        />
        <FilterSelect
          label={t("competition")}
          value={filters.competition}
          onChange={(v) => setFilters((f) => ({ ...f, competition: v }))}
          options={[
            { value: "all", label: t("all") },
            { value: "low", label: te("competition.low") },
            { value: "medium", label: te("competition.medium") },
            { value: "high", label: te("competition.high") },
          ]}
        />
        <FilterSelect
          label={t("margin")}
          value={filters.margin}
          onChange={(v) => setFilters((f) => ({ ...f, margin: v }))}
          options={[
            { value: "all", label: t("all") },
            { value: "high", label: te("level.high") },
            { value: "medium", label: te("level.medium") },
          ]}
        />
        <FilterSelect
          label={t("recommendation")}
          value={filters.recommendation}
          onChange={(v) => setFilters((f) => ({ ...f, recommendation: v }))}
          options={[
            { value: "all", label: t("all") },
            { value: "launch", label: te("recommendation.launch") },
            { value: "test", label: te("recommendation.test") },
            { value: "not_now", label: te("recommendation.not_now") },
          ]}
        />
      </div>

      <div className="table-wrap max-h-[70vh]">
        <table className="data-table">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{ asc: " ↑", desc: " ↓" }[header.column.getIsSorted() as string] ??
                      null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-10 text-center text-slate-500">
                  …
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-10 text-center text-slate-500">
                  —
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <tr
                    className={expanded === row.original.id ? "expanded" : undefined}
                    onClick={() =>
                      setExpanded((id) =>
                        id === row.original.id ? null : row.original.id
                      )
                    }
                    style={{ cursor: "pointer" }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {expanded === row.original.id && (
                    <tr className="expanded">
                      <td colSpan={columns.length} className="bg-teal-50/40">
                        <div className="grid gap-3 p-2 md:grid-cols-2">
                          <div>
                            <div className="text-[11px] uppercase tracking-wide text-slate-500">
                              {t("columns.offer")}
                            </div>
                            <div className="mt-1 text-sm text-slate-800">
                              {locale === "ru"
                                ? row.original.exampleOfferRu
                                : row.original.exampleOffer}
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] uppercase tracking-wide text-slate-500">
                              {t("columns.price")}
                            </div>
                            <div className="mt-1 text-sm font-medium text-slate-900">
                              {row.original.priceRange}
                            </div>
                            <div className="mt-2 text-[11px] text-slate-500">
                              source: {row.original.source} · confidence{" "}
                              {Math.round(row.original.confidence * 100)}%
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="space-y-1">
      <div className="text-[11px] font-medium text-slate-500">{label}</div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
