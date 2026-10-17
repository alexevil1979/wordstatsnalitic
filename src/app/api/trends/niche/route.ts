import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeNiche } from "@/lib/trends/niche-analysis";

export const runtime = "nodejs";
export const maxDuration = 120;

const bodySchema = z.object({
  nicheId: z.string().min(1),
  country: z.string().length(2),
  timeframe: z
    .enum(["now 7-d", "today 3-m", "today 12-m", "today 5-y"])
    .optional(),
  force: z.boolean().optional(),
  upsertCatalog: z.boolean().optional(),
  queryLimit: z.number().int().min(1).max(8).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = bodySchema.parse(await req.json());
    const data = await analyzeNiche({
      nicheId: body.nicheId,
      country: body.country,
      timeframe: body.timeframe,
      force: body.force,
      upsertCatalog: body.upsertCatalog ?? true,
      queryLimit: body.queryLimit ?? 4,
      delayMs: 3000,
    });
    return NextResponse.json({ data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Niche analysis failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
