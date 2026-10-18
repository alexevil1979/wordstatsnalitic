import { NextRequest, NextResponse } from "next/server";
import { fulfillPaidPayment } from "@/lib/billing/gateways/fulfill";
import { getDriver, webhookFamilyCodes } from "@/lib/billing/gateways/manager";
import { getGateway } from "@/lib/billing/gateways/store";
import { applyProToUser, getStripe, revokePro } from "@/lib/billing/stripe";

export const runtime = "nodejs";

/**
 * Unified webhooks — same path idea as fullvpnservice /api/webhooks/payments/{code}
 * Also keep legacy /api/billing/webhook for Stripe subscription events.
 */
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> }
) {
  const { code: raw } = await ctx.params;
  const code = raw.toLowerCase();

  // Stripe subscription lifecycle (customer.subscription.*) still uses stripe helper
  if (code === "stripe") {
    const handled = await tryStripeSubscriptionWebhook(req);
    if (handled) return handled;
  }

  const candidates = webhookFamilyCodes(code);
  let verified: { driverCode: string } | null = null;
  let parseResult = null as Awaited<ReturnType<ReturnType<typeof getDriver>["parseWebhook"]>> | null;

  for (const candidate of candidates) {
    const gw = getGateway(candidate);
    if (!gw?.enabled && candidate !== code) continue;
    const driver = getDriver(candidate);
    const cfg = { ...gw?.config, test_mode: gw?.testMode };
    const ok = await driver.verifyWebhook(req.clone(), cfg || {});
    if (!ok) continue;
    verified = { driverCode: candidate };
    parseResult = await driver.parseWebhook(req.clone(), cfg || {});
    break;
  }

  if (!verified || !parseResult) {
    // FreeKassa probe
    if (code === "freekassa") {
      return new NextResponse("YES", { status: 200 });
    }
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  if (parseResult.paid && parseResult.internalPaymentId) {
    const paymentId = String(parseResult.internalPaymentId);
    fulfillPaidPayment(paymentId, parseResult.externalId);
  }

  if (parseResult.ackBody) {
    return new NextResponse(parseResult.ackBody, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
  return NextResponse.json({ received: true });
}

async function tryStripeSubscriptionWebhook(req: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return null;
  const sig = req.headers.get("stripe-signature");
  if (!sig) return null;
  let event;
  try {
    event = stripe.webhooks.constructEvent(await req.clone().text(), sig, secret);
  } catch {
    return null;
  }

  // If this is a one-time payment checkout with payment_id metadata, let unified path handle via parse
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      mode?: string;
      metadata?: { payment_id?: string; userId?: string };
      customer?: string;
      subscription?: string;
    };
    if (session.metadata?.payment_id) {
      fulfillPaidPayment(session.metadata.payment_id, String(session.subscription || session.customer || ""));
      return NextResponse.json({ received: true });
    }
    if (session.mode === "subscription" && session.metadata?.userId) {
      applyProToUser(session.metadata.userId, {
        stripeCustomerId: String(session.customer || ""),
        stripeSubscriptionId: String(session.subscription || ""),
        status: "active",
      });
      return NextResponse.json({ received: true });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as { customer?: string };
    // handled in legacy route too — keep simple
    void sub;
  }

  if (event.type.startsWith("customer.subscription.")) {
    const sub = event.data.object as {
      id: string;
      status: string;
      customer?: string;
      metadata?: { userId?: string };
      current_period_end?: number;
    };
    const userId = sub.metadata?.userId || "";
    if (userId) {
      if (sub.status === "active" || sub.status === "trialing") {
        applyProToUser(userId, {
          stripeSubscriptionId: sub.id,
          stripeCustomerId: String(sub.customer || ""),
          periodEnd: sub.current_period_end
            ? new Date(sub.current_period_end * 1000).toISOString()
            : null,
          status: "active",
        });
      } else if (sub.status === "canceled" || sub.status === "unpaid") {
        revokePro(userId);
      }
    }
    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true });
}
