"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Field = {
  key: string;
  label: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string | number | boolean;
  help?: string;
};

type Gateway = {
  code: string;
  name: string;
  enabled: boolean;
  testMode: boolean;
  minAmountRub: number;
  config: Record<string, string | number | boolean | null | undefined>;
  fields: Field[];
  webhookUrl: string;
};

export function AdminGatewaysView() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [draft, setDraft] = useState<Gateway | null>(null);

  async function load() {
    const res = await fetch("/api/admin/gateways");
    if (!res.ok) {
      toast.error("Failed to load gateways");
      return;
    }
    const json = await res.json();
    setGateways(json.gateways || []);
    if (!selected && json.gateways?.[0]) {
      setSelected(json.gateways[0].code);
      setDraft(json.gateways[0]);
    } else if (selected) {
      const g = (json.gateways as Gateway[]).find((x) => x.code === selected);
      if (g) setDraft(g);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pick(code: string) {
    setSelected(code);
    const g = gateways.find((x) => x.code === code);
    if (g) setDraft({ ...g, config: { ...g.config } });
  }

  async function save() {
    if (!draft) return;
    const res = await fetch("/api/admin/gateways", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: draft.code,
        name: draft.name,
        enabled: draft.enabled,
        testMode: draft.testMode,
        minAmountRub: draft.minAmountRub,
        config: draft.config,
      }),
    });
    if (!res.ok) {
      toast.error("Save failed");
      return;
    }
    toast.success("Gateway saved");
    void load();
  }

  if (!draft) {
    return <div className="py-8 text-center text-slate-500">Loading payment gateways…</div>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <div className="surface max-h-[70vh] overflow-y-auto p-2">
        {gateways.map((g) => (
          <button
            key={g.code}
            type="button"
            onClick={() => pick(g.code)}
            className={`mb-1 flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm ${
              selected === g.code ? "bg-teal-50 text-teal-900" : "hover:bg-slate-50"
            }`}
          >
            <span>{g.name}</span>
            <span
              className={`h-2 w-2 rounded-full ${g.enabled ? "bg-emerald-500" : "bg-slate-300"}`}
            />
          </button>
        ))}
      </div>

      <div className="surface space-y-4 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="font-display text-xl">{draft.name}</h2>
            <p className="text-xs text-slate-500">code: {draft.code}</p>
          </div>
          <div className="flex gap-3 text-sm">
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={draft.enabled}
                onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })}
              />
              Enabled
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={draft.testMode}
                onChange={(e) => setDraft({ ...draft, testMode: e.target.checked })}
              />
              Test mode
            </label>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Display name</Label>
          <Input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Min amount (RUB)</Label>
          <Input
            type="number"
            value={draft.minAmountRub}
            onChange={(e) => setDraft({ ...draft, minAmountRub: Number(e.target.value) })}
          />
        </div>

        <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-600">
          Webhook URL:{" "}
          <code className="break-all text-slate-900">{draft.webhookUrl}</code>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {draft.fields.map((f) => {
            if (f.type === "toggle") {
              return (
                <label key={f.key} className="flex items-center gap-2 text-sm md:col-span-2">
                  <input
                    type="checkbox"
                    checked={Boolean(draft.config[f.key] ?? f.defaultValue)}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        config: { ...draft.config, [f.key]: e.target.checked },
                      })
                    }
                  />
                  {f.label}
                </label>
              );
            }
            const isSecret = f.type === "password" || /secret|password|token|key/i.test(f.key);
            const val = draft.config[f.key];
            return (
              <div key={f.key} className="space-y-1.5">
                <Label>{f.label}</Label>
                <Input
                  type={isSecret ? "password" : f.type === "number" ? "number" : "text"}
                  placeholder={
                    draft.config[`${f.key}__set`]
                      ? "•••• set — leave blank to keep"
                      : f.placeholder || String(f.defaultValue ?? "")
                  }
                  value={typeof val === "string" || typeof val === "number" ? String(val) : ""}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      config: {
                        ...draft.config,
                        [f.key]:
                          f.type === "number" ? Number(e.target.value) : e.target.value,
                      },
                    })
                  }
                />
                {f.help ? <p className="text-[11px] text-slate-500">{f.help}</p> : null}
              </div>
            );
          })}
        </div>

        <Button onClick={() => void save()}>Save gateway</Button>
      </div>
    </div>
  );
}
