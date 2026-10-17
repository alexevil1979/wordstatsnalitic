import { eq } from "drizzle-orm";
import { db } from "@/db";
import { appSettings } from "@/db/schema";

export const SETTING_KEYS = [
  "KEYWORD_PROVIDER",
  "TRENDS_CACHE_TTL_HOURS",
  "SERPAPI_KEY",
  "DATAFORSEO_LOGIN",
  "DATAFORSEO_PASSWORD",
  "AHREFS_API_TOKEN",
  "TRENDS_PYTHON",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];

const SECRET_KEYS = new Set<SettingKey>([
  "SERPAPI_KEY",
  "DATAFORSEO_LOGIN",
  "DATAFORSEO_PASSWORD",
  "AHREFS_API_TOKEN",
]);


export function getSetting(key: SettingKey, fallback = ""): string {
  const fromEnv = process.env[key];
  if (fromEnv && fromEnv.length > 0) return fromEnv;
  const row = db.select().from(appSettings).where(eq(appSettings.key, key)).get();
  return row?.value ?? fallback;
}

export function getAllSettings(): Record<SettingKey, string> {
  const out = {} as Record<SettingKey, string>;
  for (const key of SETTING_KEYS) {
    out[key] = getSetting(key, key === "KEYWORD_PROVIDER" ? "google_trends" : key === "TRENDS_CACHE_TTL_HOURS" ? "24" : "");
  }
  return out;
}

export function getPublicSettings(): Record<string, string | boolean> {
  const all = getAllSettings();
  return {
    KEYWORD_PROVIDER: all.KEYWORD_PROVIDER,
    TRENDS_CACHE_TTL_HOURS: all.TRENDS_CACHE_TTL_HOURS,
    TRENDS_PYTHON: all.TRENDS_PYTHON,
    hasSerpApiKey: Boolean(all.SERPAPI_KEY),
    hasDataForSeo: Boolean(all.DATAFORSEO_LOGIN && all.DATAFORSEO_PASSWORD),
    hasAhrefs: Boolean(all.AHREFS_API_TOKEN),
  };
}

export function setSettings( partial: Partial<Record<SettingKey, string>>) {
  const now = new Date().toISOString();
  for (const [key, value] of Object.entries(partial) as [SettingKey, string][]) {
    if (!SETTING_KEYS.includes(key)) continue;
    // empty string on secret = keep existing
    if (SECRET_KEYS.has(key) && value === "") continue;
    const existing = db.select().from(appSettings).where(eq(appSettings.key, key)).get();
    if (existing) {
      db.update(appSettings)
        .set({ value, updatedAt: now })
        .where(eq(appSettings.key, key))
        .run();
    } else {
      db.insert(appSettings).values({ key, value, updatedAt: now }).run();
    }
  }
}

export function isSecretKey(key: string): boolean {
  return SECRET_KEYS.has(key as SettingKey);
}
