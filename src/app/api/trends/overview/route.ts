import { NextResponse } from "next/server";
import { getMarketOverview } from "@/lib/trends/overview";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ data: getMarketOverview() });
}
