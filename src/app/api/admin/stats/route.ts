import { NextResponse } from "next/server";
import { sql, eq } from "drizzle-orm";
import { db } from "@/db";
import { users, usageEvents, subscriptions } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { getPlan } from "@/lib/billing/plans";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    const usersTotal = db.select({ c: sql<number>`count(*)` }).from(users).get()?.c ?? 0;
    const proActive =
      db
        .select({ c: sql<number>`count(*)` })
        .from(users)
        .where(eq(users.plan, "pro"))
        .get()?.c ?? 0;
    const day = new Date().toISOString().slice(0, 10);
    const trendsToday =
      db
        .select({ c: sql<number>`coalesce(sum(${usageEvents.units}), 0)` })
        .from(usageEvents)
        .where(eq(usageEvents.day, day))
        .get()?.c ?? 0;
    const pro = getPlan("pro");
    const mrr = Number(proActive) * (pro.priceCents / 100);
    const subs = db.select().from(subscriptions).all().length;
    return NextResponse.json({
      usersTotal: Number(usersTotal),
      proActive: Number(proActive),
      trendsToday: Number(trendsToday),
      mrr,
      subscriptions: subs,
    });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
