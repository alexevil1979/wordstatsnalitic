import { NextRequest, NextResponse } from "next/server";
import { publicMethods } from "@/lib/billing/gateways/initiate";
import { getPlan } from "@/lib/billing/plans";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get("locale") || "ru";
  const plan = getPlan("pro");
  return NextResponse.json({
    methods: publicMethods(locale),
    amountRub: plan.priceRub || 2490,
    amountUsd: (plan.priceCents || 2900) / 100,
    plan: { id: plan.id, name: plan.name },
  });
}
