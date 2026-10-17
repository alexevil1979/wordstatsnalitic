import { NextResponse } from "next/server";
import { listInsights } from "@/lib/repositories/opportunities";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ data: listInsights() });
}
