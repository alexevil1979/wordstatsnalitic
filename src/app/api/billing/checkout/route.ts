import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { startProCheckout } from "@/lib/billing/gateways/initiate";
import { createCheckoutSession } from "@/lib/billing/stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireSession();
    const body = (await req.json().catch(() => ({}))) as {
      locale?: string;
      gateway?: string;
    };
    const locale = body.locale || user.locale || "ru";
    const gateway = (body.gateway || "").trim().toLowerCase();

    // Backward compatible: no gateway → Stripe subscription if configured
    if (!gateway || gateway === "stripe") {
      try {
        const result = await startProCheckout(user.id, "stripe", locale);
        return NextResponse.json({ url: result.checkoutUrl, paymentId: result.paymentId });
      } catch {
        // Fall back to legacy Stripe env-only checkout
        const session = await createCheckoutSession(user.id, locale);
        return NextResponse.json({ url: session.url });
      }
    }

    const result = await startProCheckout(user.id, gateway, locale);
    return NextResponse.json({ url: result.checkoutUrl, paymentId: result.paymentId });
  } catch (e) {
    if (e instanceof Response) return e;
    const msg = e instanceof Error ? e.message : "error";
    if (msg === "STRIPE_MISSING" || msg.includes("MISSING_CONFIG")) {
      return NextResponse.json({ error: "gateway_not_configured", message: msg }, { status: 503 });
    }
    if (msg === "GATEWAY_UNAVAILABLE" || msg === "GATEWAY_MIN_AMOUNT") {
      return NextResponse.json({ error: msg.toLowerCase() }, { status: 400 });
    }
    if (msg.includes("NOT_IMPLEMENTED")) {
      return NextResponse.json({ error: "not_implemented", message: msg }, { status: 501 });
    }
    return NextResponse.json({ error: "error", message: msg }, { status: 400 });
  }
}
