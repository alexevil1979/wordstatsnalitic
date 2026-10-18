import { eq } from "drizzle-orm";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { applyProToUser } from "@/lib/billing/stripe";

/** Mark payment paid and grant Pro for 30 days (prepaid model like fullvpnservice tariffs). */
export function fulfillPaidPayment(paymentId: string, externalId?: string | null) {
  const row = db.select().from(payments).where(eq(payments.id, paymentId)).get();
  if (!row) return { ok: false as const, reason: "not_found" };
  if (row.status === "paid") return { ok: true as const, already: true };

  const now = new Date();
  const periodEnd = new Date(now.getTime() + 30 * 24 * 3600_000).toISOString();
  db.update(payments)
    .set({
      status: "paid",
      externalId: externalId ?? row.externalId,
      paidAt: now.toISOString(),
      updatedAt: now.toISOString(),
    })
    .where(eq(payments.id, paymentId))
    .run();

  applyProToUser(row.userId, {
    status: "active",
    periodEnd,
  });

  return { ok: true as const, already: false, userId: row.userId };
}

export function getPaymentById(id: string) {
  return db.select().from(payments).where(eq(payments.id, id)).get() ?? null;
}
