import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { getUserById } from "@/lib/auth/users";
import { getPlan } from "@/lib/billing/plans";
import { getDriver } from "./manager";
import { getGateway, listEnabledGateways } from "./store";
import type { PaymentRow } from "./types";
import { yookassaNeedsTestFlag } from "./drivers/yookassa";

function toPaymentRow(
  row: typeof payments.$inferSelect,
  email?: string | null
): PaymentRow {
  let meta: Record<string, unknown> = {};
  try {
    meta = JSON.parse(row.metaJson || "{}") as Record<string, unknown>;
  } catch {
    meta = {};
  }
  return {
    id: row.id,
    userId: row.userId,
    gateway: row.gateway,
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    externalId: row.externalId,
    planId: row.planId,
    meta,
    paidAt: row.paidAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    userEmail: email,
  };
}

export async function startProCheckout(userId: string, gatewayCode: string, locale: string) {
  const user = getUserById(userId);
  if (!user || user.status !== "active") throw new Error("NO_USER");

  const plan = getPlan("pro");
  const amountRub = plan.priceRub || 2490;
  const gw = getGateway(gatewayCode);
  if (!gw || !gw.enabled) throw new Error("GATEWAY_UNAVAILABLE");
  if (gw.minAmountRub > 0 && amountRub < gw.minAmountRub) throw new Error("GATEWAY_MIN_AMOUNT");

  // RUB list price for CIS gateways; USD for Stripe/PayPal/NOW (drivers may convert).
  const usdNative = ["stripe", "paypal", "nowpayments"].includes(gw.code);
  const currency = usdNative ? "USD" : "RUB";
  const amount = usdNative
    ? Math.round((plan.priceCents || 2900)) / 100
    : amountRub;

  const now = new Date().toISOString();
  const id = nanoid(16);
  db.insert(payments)
    .values({
      id,
      userId,
      gateway: gw.code,
      amount,
      currency,
      status: "pending",
      planId: "pro",
      metaJson: JSON.stringify({ locale, plan: "pro", type: "pro_subscription" }),
      createdAt: now,
      updatedAt: now,
    })
    .run();

  const row = db.select().from(payments).where(eq(payments.id, id)).get()!;
  const payment = toPaymentRow(row, user.email);
  const driver = getDriver(gw.code);
  let config = { ...gw.config, test_mode: gw.testMode } as typeof gw.config;
  if (gw.code === "yookassa") config = yookassaNeedsTestFlag(config, gw.testMode);

  try {
    const url = await driver.createPayment(payment, config);
    if (payment.externalId) {
      db.update(payments)
        .set({ externalId: payment.externalId, updatedAt: new Date().toISOString() })
        .where(eq(payments.id, id))
        .run();
    }
    return { checkoutUrl: url, paymentId: id };
  } catch (e) {
    db.update(payments)
      .set({
        status: "failed",
        metaJson: JSON.stringify({
          ...payment.meta,
          error: e instanceof Error ? e.message : String(e),
        }),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(payments.id, id))
      .run();
    throw e;
  }
}

export function publicMethods(locale?: string) {
  const plan = getPlan("pro");
  const amountRub = plan.priceRub || 2490;
  const preferCn = (locale || "").toLowerCase().startsWith("zh");
  let list = listEnabledGateways(amountRub);
  if (preferCn) {
    const cn = list.filter((g) =>
      ["bybit_direct", "nowpayments", "exnode"].includes(g.code)
    );
    if (cn.length) list = [...cn, ...list.filter((g) => !cn.includes(g))];
  }
  return list.map((g) => ({
    code: g.code,
    name: g.name,
    minAmountRub: g.minAmountRub,
    testMode: g.testMode,
  }));
}
