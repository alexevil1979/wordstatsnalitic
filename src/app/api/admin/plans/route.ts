import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { plans } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { ensureDefaultPlans, listPlans } from "@/lib/billing/plans";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({ plans: listPlans() });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}

const schema = z.object({
  id: z.enum(["free", "pro"]),
  priceCents: z.number().int().min(0).optional(),
  dailyResearchCap: z.number().int().min(0).optional(),
  dailyXmlCap: z.number().int().min(0).optional(),
  allowPaidKeys: z.boolean().optional(),
  stripePriceId: z.string().optional(),
});

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    ensureDefaultPlans();
    const body = schema.parse(await req.json());
    const patch: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (body.priceCents !== undefined) patch.priceCents = body.priceCents;
    if (body.dailyResearchCap !== undefined) patch.dailyResearchCap = body.dailyResearchCap;
    if (body.dailyXmlCap !== undefined) patch.dailyXmlCap = body.dailyXmlCap;
    if (body.allowPaidKeys !== undefined) patch.allowPaidKeys = body.allowPaidKeys ? 1 : 0;
    if (body.stripePriceId !== undefined) patch.stripePriceId = body.stripePriceId;
    db.update(plans).set(patch).where(eq(plans.id, body.id)).run();
    return NextResponse.json({ plans: listPlans() });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "error" }, { status: 400 });
  }
}
