import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/repositories/opportunities";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ data: getDashboardStats() });
}
