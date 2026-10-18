import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { usageEvents, users } from "@/db/schema";
import { getPlan } from "./plans";

export type UsageAction = "research" | "xml_export";

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getUsageToday(userId: string, action: UsageAction): number {
  const day = todayUtc();
  const row = db
    .select({ total: sql<number>`coalesce(sum(${usageEvents.units}), 0)` })
    .from(usageEvents)
    .where(
      and(
        eq(usageEvents.userId, userId),
        eq(usageEvents.action, action),
        eq(usageEvents.day, day)
      )
    )
    .get();
  return Number(row?.total ?? 0);
}

export function recordUsage(userId: string, action: UsageAction, units = 1) {
  db.insert(usageEvents)
    .values({
      userId,
      action,
      units,
      day: todayUtc(),
      createdAt: new Date().toISOString(),
    })
    .run();
}

export function assertWithinLimit(userId: string, action: UsageAction) {
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  if (!user || user.status !== "active") {
    throw new Error("Account disabled");
  }
  const plan = getPlan(user.plan);
  const used = getUsageToday(userId, action);
  const cap = action === "research" ? plan.dailyResearchCap : plan.dailyXmlCap;
  if (used >= cap) {
    throw new Error(`Daily ${action} limit reached (${cap}). Upgrade or try tomorrow.`);
  }
  return { used, cap, plan };
}
