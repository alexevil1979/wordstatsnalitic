import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { researchTrends } from "@/lib/trends/orchestrator";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  query: z.string().min(1).max(200),
  country: z.string().length(2),
  timeframe: z
    .enum(["now 7-d", "today 3-m", "today 12-m", "today 5-y"])
    .optional(),
  force: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const body = bodySchema.parse(json);
    const data = await researchTrends(body);
    return NextResponse.json({ data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Research failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
