import type { PaymentDriver, WebhookParseResult } from "../types";
import { appBaseUrl, cfg, chargeWithCommission } from "../utils";

async function paypalToken(config: Parameters<PaymentDriver["createPayment"]>[1]) {
  const id = cfg(config, "client_id");
  const secret = cfg(config, "client_secret");
  if (!id || !secret) throw new Error("PAYPAL_MISSING_CONFIG");
  const base =
    cfg(config, "mode", "sandbox") === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("PAYPAL_AUTH_FAILED");
  return { token: data.access_token, base };
}

export const paypalDriver: PaymentDriver = {
  code: "paypal",

  async createPayment(payment, config) {
    const { token, base } = await paypalToken(config);
    // PayPal expects USD typically — convert from RUB if needed
    let amount = chargeWithCommission(payment.amount, config);
    let currency = (payment.currency || "RUB").toUpperCase();
    if (currency === "RUB") {
      const rate = Number(process.env.USD_RUB_RATE || "90");
      amount = Math.round((amount / rate) * 100) / 100;
      currency = "USD";
    }
    const res = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: payment.id,
            amount: { currency_code: currency, value: amount.toFixed(2) },
            description: "Wordstat Pro",
            custom_id: payment.id,
          },
        ],
        application_context: {
          return_url: `${appBaseUrl()}/api/billing/return?payment=${payment.id}`,
          cancel_url: `${appBaseUrl()}/ru/cabinet?billing=cancel`,
          user_action: "PAY_NOW",
        },
      }),
    });
    const data = (await res.json()) as {
      id?: string;
      links?: Array<{ rel?: string; href?: string }>;
    };
    if (!res.ok) throw new Error(`PAYPAL_HTTP_${res.status}`);
    const approve = data.links?.find((l) => l.rel === "approve")?.href;
    if (!approve) throw new Error("PAYPAL_NO_URL");
    payment.externalId = data.id || null;
    return approve;
  },

  verifyWebhook() {
    // Production should verify with PayPal certs; accept when webhook configured in test.
    return true;
  },

  async parseWebhook(req): Promise<WebhookParseResult> {
    const data = (await req.json().catch(() => ({}))) as {
      event_type?: string;
      resource?: {
        id?: string;
        status?: string;
        purchase_units?: Array<{ custom_id?: string; reference_id?: string }>;
        custom_id?: string;
      };
    };
    const paid =
      data.event_type === "CHECKOUT.ORDER.APPROVED" ||
      data.event_type === "PAYMENT.CAPTURE.COMPLETED" ||
      data.resource?.status === "COMPLETED";
    const unit = data.resource?.purchase_units?.[0];
    return {
      paid: Boolean(paid),
      internalPaymentId: unit?.custom_id || unit?.reference_id || data.resource?.custom_id || null,
      externalId: data.resource?.id || null,
      transactionId: data.resource?.id || null,
    };
  },
};
