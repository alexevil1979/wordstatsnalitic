import { eq } from "drizzle-orm";
import { db } from "@/db";
import { plans } from "@/db/schema";

export type PlanId = "free" | "pro";

export type PlanRow = {
  id: PlanId;
  name: string;
  priceCents: number;
  currency: string;
  dailyResearchCap: number;
  dailyXmlCap: number;
  allowPaidKeys: boolean;
  stripePriceId: string;
};

const DEFAULTS: PlanRow[] = [
  {
    id: "free",
    name: "Free",
    priceCents: 0,
    currency: "usd",
    dailyResearchCap: 20,
    dailyXmlCap: 3,
    allowPaidKeys: false,
    stripePriceId: "",
  },
  {
    id: "pro",
    name: "Pro",
    priceCents: 2900,
    currency: "usd",
    dailyResearchCap: 500,
    dailyXmlCap: 200,
    allowPaidKeys: true,
    stripePriceId: process.env.STRIPE_PRICE_PRO || "",
  },
];

export function ensureDefaultPlans() {
  const now = new Date().toISOString();
  for (const p of DEFAULTS) {
    const existing = db.select().from(plans).where(eq(plans.id, p.id)).get();
    if (!existing) {
      db.insert(plans)
        .values({
          id: p.id,
          name: p.name,
          priceCents: p.priceCents,
          currency: p.currency,
          dailyResearchCap: p.dailyResearchCap,
          dailyXmlCap: p.dailyXmlCap,
          allowPaidKeys: p.allowPaidKeys ? 1 : 0,
          stripePriceId: p.stripePriceId,
          active: 1,
          updatedAt: now,
        })
        .run();
    }
  }
}

export function getPlan(planId: string): PlanRow {
  ensureDefaultPlans();
  const row = db.select().from(plans).where(eq(plans.id, planId)).get();
  if (!row) return DEFAULTS.find((d) => d.id === "free")!;
  return {
    id: row.id as PlanId,
    name: row.name,
    priceCents: row.priceCents,
    currency: row.currency,
    dailyResearchCap: row.dailyResearchCap,
    dailyXmlCap: row.dailyXmlCap,
    allowPaidKeys: Boolean(row.allowPaidKeys),
    stripePriceId: row.stripePriceId || process.env.STRIPE_PRICE_PRO || "",
  };
}

export function listPlans(): PlanRow[] {
  ensureDefaultPlans();
  return db
    .select()
    .from(plans)
    .all()
    .map((row) => ({
      id: row.id as PlanId,
      name: row.name,
      priceCents: row.priceCents,
      currency: row.currency,
      dailyResearchCap: row.dailyResearchCap,
      dailyXmlCap: row.dailyXmlCap,
      allowPaidKeys: Boolean(row.allowPaidKeys),
      stripePriceId: row.stripePriceId || process.env.STRIPE_PRICE_PRO || "",
    }));
}
