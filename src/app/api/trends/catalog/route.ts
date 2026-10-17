import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { researchTrends } from "@/lib/trends/orchestrator";
import { upsertOpportunityFromTrends } from "@/lib/trends/map-to-opportunity";

export const runtime = "nodejs";

const bodySchema = z.object({
  runId: z.string().optional(),
  query: z.string().min(1),
  country: z.string().length(2),
  nicheId: z.string().min(1),
  timeframe: z.string().optional(),
  exampleOffer: z.string().optional(),
  exampleOfferRu: z.string().optional(),
  priceRange: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = bodySchema.parse(await req.json());
    const research = await researchTrends({
      query: body.query,
      country: body.country,
      timeframe: body.timeframe,
      force: false,
    });
    const result = upsertOpportunityFromTrends({
      research,
      nicheId: body.nicheId,
      exampleOffer: body.exampleOffer,
      exampleOfferRu: body.exampleOfferRu,
      priceRange: body.priceRange,
    });
    return NextResponse.json({ data: result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Catalog upsert failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
