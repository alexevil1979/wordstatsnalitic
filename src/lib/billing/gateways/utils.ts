import type { GatewayConfig } from "./types";

export function cfg(config: GatewayConfig, key: string, fallback: string = ""): string {
  const v = config[key];
  if (v === null || v === undefined) return fallback;
  return String(v);
}

export function cfgNum(config: GatewayConfig, key: string, fallback = 0): number {
  const v = config[key];
  if (typeof v === "number") return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function cfgBool(config: GatewayConfig, key: string, fallback = false): boolean {
  const v = config[key];
  if (typeof v === "boolean") return v;
  if (v === "1" || v === "true") return true;
  if (v === "0" || v === "false") return false;
  return fallback;
}

export function appBaseUrl(): string {
  return (process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}

export function chargeWithCommission(amount: number, config: GatewayConfig): number {
  const pct = cfgNum(config, "extra_commission_percent", 0);
  if (pct <= 0) return Math.round(amount * 100) / 100;
  return Math.round(amount * (1 + pct / 100) * 100) / 100;
}

export function extractDeep(obj: unknown, paths: string[]): string | null {
  for (const path of paths) {
    const parts = path.split(".");
    let cur: unknown = obj;
    for (const p of parts) {
      if (!cur || typeof cur !== "object") {
        cur = undefined;
        break;
      }
      cur = (cur as Record<string, unknown>)[p];
    }
    if (typeof cur === "string" && cur) return cur;
    if (typeof cur === "number") return String(cur);
  }
  return null;
}
