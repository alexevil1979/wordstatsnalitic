import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { subscriptions, users } from "@/db/schema";
import { getPlan } from "./plans";

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY && (process.env.STRIPE_PRICE_PRO || getPlan("pro").stripePriceId));
}

export async function createCheckoutSession(userId: string, locale: string) {
  const stripe = getStripe();
  if (!stripe) throw new Error("STRIPE_MISSING");
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  if (!user) throw new Error("NO_USER");
  const priceId = getPlan("pro").stripePriceId || process.env.STRIPE_PRICE_PRO || "";
  if (!priceId) throw new Error("STRIPE_MISSING");

  let customerId = user.stripeCustomerId || undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: { userId },
    });
    customerId = customer.id;
    db.update(users)
      .set({ stripeCustomerId: customerId, updatedAt: new Date().toISOString() })
      .where(eq(users.id, userId))
      .run();
  }

  const base = process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${base}/${locale}/cabinet?billing=success`,
    cancel_url: `${base}/${locale}/cabinet?billing=cancel`,
    metadata: { userId },
    subscription_data: { metadata: { userId } },
  });
  return session;
}

export async function createPortalSession(userId: string, locale: string) {
  const stripe = getStripe();
  if (!stripe) throw new Error("STRIPE_MISSING");
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  if (!user?.stripeCustomerId) throw new Error("NO_CUSTOMER");
  const base = process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  return stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${base}/${locale}/cabinet`,
  });
}

export function applyProToUser(userId: string, opts: {
  stripeSubscriptionId?: string | null;
  stripeCustomerId?: string | null;
  periodEnd?: string | null;
  status?: string;
}) {
  const now = new Date().toISOString();
  const userPatch: { plan: string; updatedAt: string; stripeCustomerId?: string } = {
    plan: "pro",
    updatedAt: now,
  };
  if (opts.stripeCustomerId) userPatch.stripeCustomerId = opts.stripeCustomerId;
  db.update(users).set(userPatch).where(eq(users.id, userId)).run();

  const sub = db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).get();
  if (sub) {
    db.update(subscriptions)
      .set({
        status: opts.status || "active",
        planId: "pro",
        stripeSubscriptionId: opts.stripeSubscriptionId ?? sub.stripeSubscriptionId,
        stripeCustomerId: opts.stripeCustomerId ?? sub.stripeCustomerId,
        currentPeriodEnd: opts.periodEnd ?? sub.currentPeriodEnd,
        updatedAt: now,
      })
      .where(eq(subscriptions.id, sub.id))
      .run();
  } else {
    db.insert(subscriptions)
      .values({
        id: nanoid(),
        userId,
        planId: "pro",
        status: opts.status || "active",
        stripeSubscriptionId: opts.stripeSubscriptionId || null,
        stripeCustomerId: opts.stripeCustomerId || null,
        currentPeriodEnd: opts.periodEnd || null,
        createdAt: now,
        updatedAt: now,
      })
      .run();
  }
}

export function revokePro(userId: string) {
  const now = new Date().toISOString();
  db.update(users).set({ plan: "free", updatedAt: now }).where(eq(users.id, userId)).run();
  const sub = db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).get();
  if (sub) {
    db.update(subscriptions)
      .set({ status: "canceled", updatedAt: now })
      .where(eq(subscriptions.id, sub.id))
      .run();
  }
}
