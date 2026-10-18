import { randomUUID } from "crypto";
import type { GatewayConfig, PaymentDriver, WebhookParseResult } from "../types";
import { appBaseUrl, cfg, chargeWithCommission } from "../utils";

export const yookassaDriver: PaymentDriver = {
  code: "yookassa",

  async createPayment(payment, config) {
    const shopId = cfg(config, "shop_id");
    const secret = cfg(config, "secret_key");
    if (!shopId || !secret) throw new Error("YOOKASSA_MISSING_CONFIG");

    const amount = chargeWithCommission(payment.amount, config);
    const res = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${shopId}:${secret}`).toString("base64"),
        "Idempotence-Key": randomUUID(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: {
          value: amount.toFixed(2),
          currency: payment.currency || "RUB",
        },
        capture: true,
        confirmation: {
          type: "redirect",
          return_url: `${appBaseUrl()}/api/billing/return?payment=${payment.id}`,
        },
        description: `Wordstat Pro #${payment.id}`,
        metadata: { payment_id: payment.id },
        test: Boolean(config.test_mode ?? false),
      }),
    });
    const data = (await res.json()) as {
      id?: string;
      confirmation?: { confirmation_url?: string };
      description?: string;
    };
    if (!res.ok || !data.confirmation?.confirmation_url) {
      throw new Error(`YOOKASSA_HTTP_${res.status}`);
    }
    payment.externalId = data.id || null;
    return data.confirmation.confirmation_url;
  },

  verifyWebhook(req, config) {
    const token = cfg(config, "webhook_secret");
    if (!token) return true;
    return req.headers.get("x-yoomoney-signature") === token;
  },

  async parseWebhook(req): Promise<WebhookParseResult> {
    const payload = (await req.json()) as {
      object?: { status?: string; id?: string; metadata?: { payment_id?: string } };
      status?: string;
      id?: string;
      metadata?: { payment_id?: string };
    };
    const obj = payload.object ?? payload;
    return {
      paid: (obj.status || "") === "succeeded",
      internalPaymentId: obj.metadata?.payment_id || null,
      externalId: obj.id || null,
      transactionId: obj.id || null,
    };
  },
};

export function yookassaNeedsTestFlag(config: GatewayConfig, testMode: boolean): GatewayConfig {
  return { ...config, test_mode: testMode } as GatewayConfig;
}
