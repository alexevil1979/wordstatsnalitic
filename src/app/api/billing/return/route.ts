import { NextRequest, NextResponse } from "next/server";
import { fulfillPaidPayment, getPaymentById } from "@/lib/billing/gateways/fulfill";

export const runtime = "nodejs";

/** Browser return URL after gateway redirect. */
export async function GET(req: NextRequest) {
  const paymentId = req.nextUrl.searchParams.get("payment") || "";
  const row = paymentId ? getPaymentById(paymentId) : null;
  let locale = "ru";
  if (row) {
    try {
      const meta = JSON.parse(row.metaJson || "{}") as { locale?: string };
      locale = meta.locale || "ru";
    } catch {
      /* ignore */
    }
    if (row.status === "pending") {
      // Optimistic: some gateways only notify via webhook; keep pending and show success page
      // If already paid via webhook, fine. Don't force fulfill without proof.
    } else if (row.status === "paid") {
      fulfillPaidPayment(paymentId);
    }
  }
  const base = process.env.APP_URL || "https://wordstat.1tlt.ru";
  const q = row?.status === "paid" ? "success" : "pending";
  return NextResponse.redirect(`${base}/${locale}/cabinet?billing=${q}`);
}
