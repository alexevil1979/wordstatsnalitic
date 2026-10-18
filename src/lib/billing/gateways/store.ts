import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { paymentGateways } from "@/db/schema";
import { GATEWAY_CATALOG } from "./catalog";
import type { GatewayConfig, GatewayRow } from "./types";

function parseConfig(raw: string): GatewayConfig {
  try {
    const v = JSON.parse(raw || "{}");
    return typeof v === "object" && v ? (v as GatewayConfig) : {};
  } catch {
    return {};
  }
}

function mapRow(row: typeof paymentGateways.$inferSelect): GatewayRow {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    enabled: Boolean(row.enabled),
    testMode: Boolean(row.testMode),
    minAmountRub: Number(row.minAmountRub || 0),
    config: parseConfig(row.configJson),
    updatedAt: row.updatedAt,
  };
}

let seeded = false;

export function ensureDefaultGateways() {
  if (seeded) return;
  const now = new Date().toISOString();
  for (const def of GATEWAY_CATALOG) {
    const existing = db
      .select()
      .from(paymentGateways)
      .where(eq(paymentGateways.code, def.code))
      .get();
    if (existing) continue;
    const defaults: GatewayConfig = {};
    for (const f of def.fields) {
      if (f.defaultValue !== undefined) defaults[f.key] = f.defaultValue as string | number | boolean;
    }
    try {
      db.insert(paymentGateways)
        .values({
          id: nanoid(),
          code: def.code,
          name: def.name,
          enabled: 0,
          testMode: 1,
          minAmountRub: 0,
          configJson: JSON.stringify(defaults),
          updatedAt: now,
        })
        .run();
    } catch {
      // concurrent seed / already exists
    }
  }
  seeded = true;
}

export function listGateways(): GatewayRow[] {
  ensureDefaultGateways();
  return db.select().from(paymentGateways).all().map(mapRow);
}

export function listEnabledGateways(amountRub?: number): GatewayRow[] {
  return listGateways().filter((g) => {
    if (!g.enabled) return false;
    if (amountRub != null && g.minAmountRub > 0 && amountRub < g.minAmountRub) return false;
    return true;
  });
}

export function getGateway(code: string): GatewayRow | null {
  ensureDefaultGateways();
  const row = db
    .select()
    .from(paymentGateways)
    .where(eq(paymentGateways.code, code.toLowerCase()))
    .get();
  return row ? mapRow(row) : null;
}

export function updateGateway(
  code: string,
  patch: {
    name?: string;
    enabled?: boolean;
    testMode?: boolean;
    minAmountRub?: number;
    config?: GatewayConfig;
  }
): GatewayRow {
  const existing = getGateway(code);
  if (!existing) throw new Error("GATEWAY_NOT_FOUND");
  const now = new Date().toISOString();
  const nextConfig = { ...existing.config };
  for (const [k, v] of Object.entries(patch.config || {})) {
    if (k.endsWith("__set")) continue;
    if (v === "" || v === null || v === undefined) continue;
    if (typeof v === "string" && v.includes("*") && existing.config[k]) continue;
    nextConfig[k] = v;
  }
  db.update(paymentGateways)
    .set({
      name: patch.name ?? existing.name,
      enabled: patch.enabled !== undefined ? (patch.enabled ? 1 : 0) : existing.enabled ? 1 : 0,
      testMode: patch.testMode !== undefined ? (patch.testMode ? 1 : 0) : existing.testMode ? 1 : 0,
      minAmountRub: patch.minAmountRub ?? existing.minAmountRub,
      configJson: JSON.stringify(nextConfig),
      updatedAt: now,
    })
    .where(eq(paymentGateways.code, existing.code))
    .run();
  return getGateway(code)!;
}

export function maskGatewayForClient(g: GatewayRow, revealSecrets = false): GatewayRow {
  if (revealSecrets) return g;
  const config: GatewayConfig = {};
  for (const [k, v] of Object.entries(g.config)) {
    if (typeof v === "string" && v && /secret|password|token|key|api_private/i.test(k)) {
      config[k] = v.length <= 4 ? "****" : `${"*".repeat(Math.min(8, v.length - 4))}${v.slice(-4)}`;
      config[`${k}__set`] = true;
    } else {
      config[k] = v;
    }
  }
  return { ...g, config };
}
