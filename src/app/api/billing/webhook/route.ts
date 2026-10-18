import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { applyProToUser, getStripe, revokePro } from "@/lib/billing/stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "stripe_missing" }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "no_sig" }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "invalid_sig" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = (session.metadata?.userId as string) || "";
        if (userId && session.mode === "subscription") {
          applyProToUser(userId, {
            stripeCustomerId: String(session.customer || ""),
            stripeSubscriptionId: String(session.subscription || ""),
            status: "active",
          });
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as {
          id: string;
          status: string;
          customer?: string | null;
          metadata?: { userId?: string };
          current_period_end?: number;
        };
        const userId = sub.metadata?.userId || "";
        const customerId = String(sub.customer || "");
        let uid = userId;
        if (!uid && customerId) {
          const u = db
            .select()
            .from(users)
            .where(eq(users.stripeCustomerId, customerId))
            .get();
          uid = u?.id || "";
        }
        if (uid) {
          const status = sub.status === "active" || sub.status === "trialing" ? "active" : sub.status;
          if (status === "active") {
            applyProToUser(uid, {
              stripeCustomerId: customerId,
              stripeSubscriptionId: sub.id,
              periodEnd: sub.current_period_end
                ? new Date(sub.current_period_end * 1000).toISOString()
                : null,
              status: "active",
            });
          } else if (status === "canceled" || status === "unpaid") {
            revokePro(uid);
          }
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const customerId = String(sub.customer || "");
        const u = db
          .select()
          .from(users)
          .where(eq(users.stripeCustomerId, customerId))
          .get();
        if (u) revokePro(u.id);
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error("stripe webhook error", e);
    return NextResponse.json({ error: "handler" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
