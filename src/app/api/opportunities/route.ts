import { NextRequest, NextResponse } from "next/server";
import {
  createOpportunity,
  listOpportunities,
} from "@/lib/repositories/opportunities";
import { opportunitySchema } from "@/lib/validation";
import type { OpportunityFilters } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const filters: OpportunityFilters = {
    country: sp.get("country") ?? undefined,
    niche: sp.get("niche") ?? undefined,
    competition: (sp.get("competition") as OpportunityFilters["competition"]) ?? undefined,
    margin: (sp.get("margin") as OpportunityFilters["margin"]) ?? undefined,
    recommendation:
      (sp.get("recommendation") as OpportunityFilters["recommendation"]) ?? undefined,
    category: (sp.get("category") as OpportunityFilters["category"]) ?? undefined,
    q: sp.get("q") ?? undefined,
    sort: sp.get("sort") ?? undefined,
    order: (sp.get("order") as OpportunityFilters["order"]) ?? undefined,
  };

  return NextResponse.json({ data: listOpportunities(filters) });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = opportunitySchema.parse(body);
    const created = createOpportunity(parsed);
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
