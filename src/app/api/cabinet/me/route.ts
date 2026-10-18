import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions, trendRuns } from "@/db/schema";
import { requireSession } from "@/lib/auth/session";
import { getPlan } from "@/lib/billing/plans";
import { getUsageToday } from "@/lib/billing/usage";
import { listKeyHints } from "@/lib/billing/user-keys";
import { isStripeConfigured } from "@/lib/billing/stripe";
import { desc } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { user } = await requireSession();
    const plan = getPlan(user.plan);
    const sub = db.select().from(subscriptions).where(eq(subscriptions.userId, user.id)).get();
    const history = db
      .select()
      .from(trendRuns)
      .where(eq(trendRuns.userId, user.id))
      .orderBy(desc(trendRuns.createdAt))
      .limit(30)
      .all()
      .map((r) => ({
        id: r.id,
        query: r.query,
        country: r.country,
        provider: r.provider,
        status: r.status,
        avgInterest: r.avgInterest,
        createdAt: r.createdAt,
      }));

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        locale: user.locale,
        role: user.role,
        plan: user.plan,
      },
      plan,
      subscription: sub
        ? {
            status: sub.status,
            currentPeriodEnd: sub.currentPeriodEnd,
          }
        : null,
      usage: {
        research: getUsageToday(user.id, "research"),
        xml_export: getUsageToday(user.id, "xml_export"),
      },
      keys: listKeyHints(user.id),
      history,
      stripeConfigured: isStripeConfigured(),
    });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
