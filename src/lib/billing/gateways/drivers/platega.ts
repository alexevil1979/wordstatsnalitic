import type { PaymentDriver, WebhookParseResult } from "../types";
import { appBaseUrl, cfg, chargeWithCommission, extractDeep } from "../utils";

export const plategaDriver: PaymentDriver = {
  code: "platega",

  async createPayment(payment, config) {
    const merchantId = cfg(config, "merchant_id");
    const secret = cfg(config, "secret");
    const base = cfg(config, "api_base_url", "https://app.platega.io").replace(/\/$/, "");
    const path = cfg(config, "api_create_path", "/v2/transaction/process");
    if (!merchantId || !secret) throw new Error("PLATEGA_MISSING_CONFIG");

    const payload: Record<string, unknown> = {
      command: cfg(config, "command", "process") || "process",
      paymentDetails: {
        amount: chargeWithCommission(payment.amount, config),
        currency: cfg(config, "currency", payment.currency || "RUB"),
      },
      description: `Wordstat Pro #${payment.id}`,
      return: cfg(config, "return_url", `${appBaseUrl()}/api/billing/return?payment=${payment.id}`),
      failedUrl: cfg(config, "failed_url", `${appBaseUrl()}/ru/cabinet?billing=cancel`),
      payload: JSON.stringify({ payment_id: payment.id, user_id: payment.userId }),
    };
    const pm = cfg(config, "payment_method");
    if (pm) payload.paymentMethod = /^\d+$/.test(pm) ? Number(pm) : pm;

    const res = await fetch(`${base}${path.startsWith("/") ? path : `/${path}`}`, {
      method: "POST",
      headers: {
        "X-MerchantId": merchantId,
        "X-Secret": secret,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as Record<string, unknown>;
    if (!res.ok) throw new Error(`PLATEGA_HTTP_${res.status}`);
    const url = extractDeep(data, [
      "redirect",
      "redirectUrl",
      "paymentUrl",
      "url",
      "link",
      "data.redirect",
      "data.url",
    ]);
    if (!url) throw new Error("PLATEGA_NO_URL");
    payment.externalId = extractDeep(data, ["transactionId", "id", "data.transactionId"]);
    return url;
  },

  verifyWebhook(req, config) {
    const key = cfg(config, "webhook_token_key");
    const value = cfg(config, "webhook_token_value");
    if (!key || !value) return true;
    return (
      req.headers.get(key.toLowerCase()) === value ||
      req.headers.get(key) === value ||
      new URL(req.url).searchParams.get(key) === value
    );
  },

  async parseWebhook(req): Promise<WebhookParseResult> {
    const data = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const status = String(
      data.status || data.Status || (data.data as Record<string, unknown>)?.status || ""
    ).toLowerCase();
    const paid =
      status === "success" ||
      status === "paid" ||
      status === "confirmed" ||
      status === "completed" ||
      Boolean(data.isPaid);
    let internal: string | null = null;
    try {
      const payload = data.payload;
      if (typeof payload === "string") {
        const parsed = JSON.parse(payload) as { payment_id?: string };
        internal = parsed.payment_id || null;
      } else if (payload && typeof payload === "object") {
        internal = String((payload as { payment_id?: string }).payment_id || "") || null;
      }
    } catch {
      /* ignore */
    }
    internal =
      internal ||
      extractDeep(data, ["payment_id", "orderId", "merchantOrderId", "data.payment_id"]);
    return {
      paid,
      internalPaymentId: internal,
      externalId: extractDeep(data, ["transactionId", "id", "data.id"]),
      transactionId: extractDeep(data, ["transactionId", "id"]),
    };
  },
};
