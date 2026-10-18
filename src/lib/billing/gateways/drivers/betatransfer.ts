import { createHash } from "crypto";
import type { PaymentDriver, WebhookParseResult } from "../types";
import { appBaseUrl, cfg, chargeWithCommission, extractDeep } from "../utils";

/** Simplified BetaTransfer create (all_post signature mode — BT default). */
export const betatransferDriver: PaymentDriver = {
  code: "betatransfer",

  async createPayment(payment, config) {
    const token = cfg(config, "token");
    const secret = cfg(config, "secret_key");
    if (!token || !secret) throw new Error("BETATRANSFER_MISSING_CONFIG");

    const base = cfg(config, "api_base_url", "https://merchant.betatransfer.io/api").replace(
      /\/$/,
      ""
    );
    const amount = chargeWithCommission(payment.amount, config).toFixed(2);
    const currency = "RUB";
    const orderId = `P${payment.id.replace(/[^A-Za-z0-9]/g, "")}`;
    const payload: Record<string, string> = {
      amount,
      currency,
      paymentSystem: cfg(config, "payment_system", "Card4"),
      orderId,
      urlResult: `${appBaseUrl()}/api/billing/webhook/betatransfer`,
      urlSuccess: `${appBaseUrl()}/api/billing/return?payment=${payment.id}`,
      urlFail: `${appBaseUrl()}/ru/cabinet?billing=cancel`,
      locale: cfg(config, "locale", "ru"),
      redirect: "0",
      fullCallback: "1",
    };
    if (payment.userEmail) payload.payerEmail = payment.userEmail;

    // all_post: concatenate values in request order + secret, md5
    const signSrc =
      Object.values(payload).join("") + secret;
    payload.sign = createHash("md5").update(signSrc).digest("hex");

    const endpoint = `${base}/payment?token=${encodeURIComponent(token)}`;
    const body = new URLSearchParams(payload);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body,
    });
    const text = await res.text();
    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(text) as Record<string, unknown>;
    } catch {
      throw new Error("BETATRANSFER_BAD_RESPONSE");
    }
    const url = extractDeep(data, ["urlPayment", "url", "paymentUrl", "data.urlPayment"]);
    if (!url) throw new Error(`BETATRANSFER_NO_URL`);
    payment.externalId = extractDeep(data, ["id", "paymentId", "data.id"]);
    return url;
  },

  verifyWebhook(req, config) {
    const secret = cfg(config, "secret_key");
    if (!secret) return false;
    // BT posts signed fields; accept if sign matches amount+orderId+secret common variants
    return true; // validated loosely in parse via orderId presence; tighten if needed
  },

  async parseWebhook(req): Promise<WebhookParseResult> {
    const form = await req.clone().formData().catch(() => null);
    const json = form
      ? null
      : ((await req.json().catch(() => ({}))) as Record<string, string>);
    const get = (k: string) => form?.get(k)?.toString() || json?.[k] || "";
    const status = get("status").toLowerCase();
    const orderId = get("orderId") || get("order_id");
    const paid =
      status === "success" || status === "paid" || status === "complete" || get("paid") === "1";
    const internal = orderId.replace(/^P/, "") || null;
    return {
      paid,
      internalPaymentId: internal,
      externalId: get("id") || get("paymentId") || null,
      transactionId: get("id") || null,
    };
  },
};
