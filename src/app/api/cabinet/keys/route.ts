import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import {
  KEY_PROVIDERS,
  assertCanStorePaidKeys,
  listKeyHints,
  upsertUserKey,
  type KeyProvider,
} from "@/lib/billing/user-keys";

export const runtime = "nodejs";

const schema = z.object({
  serpapi: z.string().optional(),
  dataforseo_login: z.string().optional(),
  dataforseo_password: z.string().optional(),
  ahrefs: z.string().optional(),
});

export async function GET() {
  try {
    const { user } = await requireSession();
    return NextResponse.json({ keys: listKeyHints(user.id) });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user } = await requireSession();
    assertCanStorePaidKeys(user);
    const body = schema.parse(await req.json());
    for (const provider of KEY_PROVIDERS) {
      const value = body[provider as keyof typeof body];
      if (typeof value === "string" && value.length > 0) {
        upsertUserKey(user.id, provider as KeyProvider, value);
      }
    }
    return NextResponse.json({ ok: true, keys: listKeyHints(user.id) });
  } catch (e) {
    if (e instanceof Response) return e;
    if (e instanceof Error && e.message === "PRO_ONLY") {
      return NextResponse.json({ error: "pro_only" }, { status: 402 });
    }
    return NextResponse.json({ error: "error" }, { status: 400 });
  }
}
