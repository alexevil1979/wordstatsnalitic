"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SPHERES,
  getSphere,
  groupLabel,
  searchSpheres,
  sphereLabel,
  type Sphere,
  type SphereGroup,
} from "@/data/spheres";

type Props = {
  value: string;
  onChange: (id: string) => void;
  allowAll?: boolean;
  className?: string;
  size?: "default" | "lg";
};

export function SphereSelect({
  value,
  onChange,
  allowAll = true,
  className,
  size = "default",
}: Props) {
  const t = useTranslations("spheres");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => searchSpheres(q, locale), [q, locale]);

  const grouped = useMemo(() => {
    const map = new Map<SphereGroup, Sphere[]>();
    for (const s of filtered) {
      const arr = map.get(s.group) ?? [];
      arr.push(s);
      map.set(s.group, arr);
    }
    return map;
  }, [filtered]);

  const selected = value ? getSphere(value) : null;
  const display = selected
    ? sphereLabel(selected, locale)
    : allowAll
      ? t("all")
      : t("placeholder");

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQ("");
    }
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative w-full max-w-xl", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-md border border-slate-200 bg-white text-left text-slate-900 shadow-sm transition hover:border-teal-700/40",
          size === "lg" ? "h-12 px-4 text-base" : "h-10 px-3 text-sm"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={cn("truncate", !selected && allowAll && "text-slate-600")}>
          {display}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {open ? (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("search")}
              className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
            {q ? (
              <button type="button" onClick={() => setQ("")} className="text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
          <div className="max-h-72 overflow-y-auto py-1" role="listbox">
            {allowAll ? (
              <button
                type="button"
                className={cn(
                  "flex w-full px-3 py-2 text-left text-sm hover:bg-teal-50",
                  !value && "bg-teal-50 font-medium text-teal-900"
                )}
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                {t("all")}
              </button>
            ) : null}
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-slate-500">{t("empty")}</div>
            ) : (
              [...grouped.entries()].map(([group, items]) => (
                <div key={group}>
                  <div className="sticky top-0 bg-slate-50 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    {groupLabel(group, locale)}
                  </div>
                  {items.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      role="option"
                      aria-selected={value === s.id}
                      className={cn(
                        "flex w-full px-3 py-2 text-left text-sm hover:bg-teal-50",
                        value === s.id && "bg-teal-50 font-medium text-teal-900"
                      )}
                      onClick={() => {
                        onChange(s.id);
                        setOpen(false);
                      }}
                    >
                      {sphereLabel(s, locale)}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
          <div className="border-t border-slate-100 px-3 py-1.5 text-[11px] text-slate-500">
            {t("count", { n: SPHERES.length })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
