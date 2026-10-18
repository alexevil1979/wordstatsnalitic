import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { createPortalSession } from "@/lib/billing/stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireSession();
    const body = (await req.json().catch(() => ({}))) as { locale?: string };
    const locale = body.locale || user.locale || "ru";
    const session = await createPortalSession(user.id, locale);
    return NextResponse.json({ url: session.url });
  } catch (e) {
    if (e instanceof Response) return e;
    const msg = e instanceof Error ? e.message : "error";
    if (msg === "STRIPE_MISSING" || msg === "NO_CUSTOMER") {
      return NextResponse.json({ error: msg.toLowerCase() }, { status: 503 });
    }
    return NextResponse.json({ error: "error" }, { status: 400 });
  }
}
