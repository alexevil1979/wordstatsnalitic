import { NextResponse } from "next/server";
import { listCountries, listNiches } from "@/lib/repositories/opportunities";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    data: {
      countries: listCountries(),
      niches: listNiches(),
    },
  });
}
