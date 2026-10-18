import { createHmac } from "crypto";
import type { PaymentDriver, WebhookParseResult } from "../types";
import { appBaseUrl, cfg, chargeWithCommission } from "../utils";

export const nowpaymentsDriver: PaymentDriver = {
  code: "nowpayments",

  async createPayment(payment, config) {
    const key = cfg(config, "api_key");
    if (!key) throw new Error("NOWPAYMENTS_MISSING_CONFIG");

    let priceAmount = chargeWithCommission(payment.amount, config);
    let priceCurrency = (payment.currency || "rub").toLowerCase();
    // Prefer USD for NOWPayments stability when paying from RUB list price
    if (priceCurrency === "rub") {
      const rate = Number(process.env.USD_RUB_RATE || "90");
      if (rate > 0) {
        priceAmount = Math.round((priceAmount / rate) * 100) / 100;
        priceCurrency = "usd";
      }
    }

    const payCurrency = cfg(config, "pay_currency", "usdttrc20").toLowerCase();
    const payload: Record<string, unknown> = {
      price_amount: priceAmount,
      price_currency: priceCurrency,
      order_id: payment.id,
      order_description: `Wordstat Pro #${payment.id}`,
      ipn_callback_url: `${appBaseUrl()}/api/billing/webhook/nowpayments`,
      success_url: `${appBaseUrl()}/api/billing/return?payment=${payment.id}`,
      cancel_url: `${appBaseUrl()}/ru/cabinet?billing=cancel`,
    };
    if (payCurrency) payload.pay_currency = payCurrency;

    const res = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as {
      id?: string | number;
      invoice_url?: string;
      payment_id?: string | number;
    };
    if (!res.ok) throw new Error(`NOWPAYMENTS_HTTP_${res.status}`);

    let url = (data.invoice_url || "").trim();
    if (!url && data.id != null) url = `https://nowpayments.io/payment/?iid=${data.id}`;
    if (!url) throw new Error("NOWPAYMENTS_NO_URL");
    payment.externalId = data.id != null ? String(data.id) : null;
    return url;
  },

  async verifyWebhook(req, config) {
    const secret = cfg(config, "ipn_secret");
    if (!secret) return Boolean(config.test_mode);
    const sig = req.headers.get("x-nowpayments-sig") || "";
    const raw = await req.clone().text();
    let sorted: unknown;
    try {
      sorted = sortKeys(JSON.parse(raw));
    } catch {
      return false;
    }
    const encoded = JSON.stringify(sorted);
    const calc = createHmac("sha512", secret).update(encoded).digest("hex");
    return calc === sig;
  },

  async parseWebhook(req): Promise<WebhookParseResult> {
    const data = (await req.json()) as {
      payment_status?: string;
      order_id?: string;
      invoice_id?: string | number;
      payment_id?: string | number;
    };
    const status = (data.payment_status || "").toLowerCase();
    const paid = status === "finished" || status === "confirmed" || status === "sending";
    return {
      paid,
      internalPaymentId: data.order_id || null,
      externalId: data.invoice_id != null ? String(data.invoice_id) : null,
      transactionId: data.payment_id != null ? String(data.payment_id) : null,
    };
  },
};

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(obj).sort()) out[k] = sortKeys(obj[k]);
    return out;
  }
  return value;
}
