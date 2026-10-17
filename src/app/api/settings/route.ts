import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  SETTING_KEYS,
  getPublicSettings,
  setSettings,
  type SettingKey,
} from "@/lib/settings";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ data: getPublicSettings() });
}

const patchSchema = z.record(z.string(), z.string());

export async function PATCH(req: NextRequest) {
  try {
    const body = patchSchema.parse(await req.json());
    const partial: Partial<Record<SettingKey, string>> = {};
    for (const [k, v] of Object.entries(body)) {
      if ((SETTING_KEYS as readonly string[]).includes(k)) {
        partial[k as SettingKey] = v;
      }
    }
    setSettings(partial);
    return NextResponse.json({ data: getPublicSettings() });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid settings";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
