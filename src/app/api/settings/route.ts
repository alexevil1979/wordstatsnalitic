import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import {
  SETTING_KEYS,
  getPublicSettings,
  setSettings,
  type SettingKey,
} from "@/lib/settings";

export const runtime = "nodejs";

/** Platform-level Trends worker settings — admin only. User API keys live in Cabinet. */
export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({ data: getPublicSettings() });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}

const patchSchema = z.record(z.string(), z.string());

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const body = patchSchema.parse(await req.json());
    const partial: Partial<Record<SettingKey, string>> = {};
    for (const [k, v] of Object.entries(body)) {
      if ((SETTING_KEYS as readonly string[]).includes(k)) {
        // Never store user-facing paid provider keys on the platform.
        if (k === "SERPAPI_KEY" || k === "DATAFORSEO_LOGIN" || k === "DATAFORSEO_PASSWORD" || k === "AHREFS_API_TOKEN") {
          continue;
        }
        partial[k as SettingKey] = v;
      }
    }
    setSettings(partial);
    return NextResponse.json({ data: getPublicSettings() });
  } catch (e) {
    if (e instanceof Response) return e;
    const message = e instanceof Error ? e.message : "Invalid settings";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
