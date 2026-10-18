import { createHmac } from "crypto";
import type { PaymentDriver, WebhookParseResult } from "../types";
import { appBaseUrl, cfg, cfgBool, chargeWithCommission, extractDeep } from "../utils";

export function isFriendlyFamily(code: string) {
  return ["friendlypay", "friendlypay_card", "friendlypay_sbp"].includes(code.toLowerCase());
}

export function createFriendlyPayDriver(code: string): PaymentDriver {
  const defaultType = code.includes("sbp") ? "sbp" : "card";
  return {
    code,

    async createPayment(payment, config) {
      const token = cfg(config, "api_token");
      const base = cfg(config, "api_base_url", "https://pay.friendlypay.io/api").replace(/\/$/, "");
      if (!token) throw new Error("FRIENDLYPAY_MISSING_CONFIG");
      const txType = cfg(config, "transaction_type", defaultType);
      const amount = chargeWithCommission(payment.amount, config);
      const minor = cfgBool(config, "amount_in_minor_units", true);
      const value = minor ? Math.round(amount * 100) : amount;

      const payload = {
        merchantOrderId: payment.id,
        callbackUrl: `${appBaseUrl()}/api/billing/webhook/friendlypay`,
        orderAmount: {
          value,
          currency: cfg(config, "currency", payment.currency || "RUB").toUpperCase(),
        },
        description: `Wordstat Pro #${payment.id}`,
      };
      const body = JSON.stringify(payload);
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-fp-api-token": token,
      };
      const secret = cfg(config, "secret_key");
      if (secret) {
        const enc = cfg(config, "signature_encoding", "hex");
        const hmac = createHmac("sha256", secret).update(body);
        headers["x-fp-signature"] = enc === "base64" ? hmac.digest("base64") : hmac.digest("hex");
      }

      const res = await fetch(`${base}/v1/transactions/${txType}`, {
        method: "POST",
        headers,
        body,
      });
      const data = (await res.json()) as Record<string, unknown>;
      if (!res.ok) throw new Error(`FRIENDLYPAY_HTTP_${res.status}`);
      const txId = extractDeep(data, ["transactionId", "transaction_id", "id"]);
      if (!txId) throw new Error("FRIENDLYPAY_BAD_CREATE_RESPONSE");

      // Fetch payment URL
      const getRes = await fetch(`${base}/v1/transactions/${txType}/${encodeURIComponent(txId)}`, {
        headers: { "x-fp-api-token": token, Accept: "application/json" },
      });
      const tx = (await getRes.json().catch(() => ({}))) as Record<string, unknown>;
      const url =
        extractDeep(tx, ["paymentUrl", "payment_url", "url", "redirectUrl", "data.paymentUrl"]) ||
        extractDeep(data, ["paymentUrl", "payment_url", "url"]);
      if (!url) throw new Error("FRIENDLYPAY_NO_PAYMENT_URL");
      payment.externalId = txId;
      return url;
    },

    verifyWebhook(req, config) {
      const token = cfg(config, "api_token");
      if (!token) return cfgBool(config, "test_mode", false);
      const header = req.headers.get("x-fp-api-token") || req.headers.get("authorization") || "";
      return header.includes(token) || header === token;
    },

    async parseWebhook(req): Promise<WebhookParseResult> {
      const data = (await req.json().catch(() => ({}))) as Record<string, unknown>;
      const status = String(data.status || data.paymentStatus || "").toLowerCase();
      const paid =
        status === "paid" ||
        status === "success" ||
        status === "completed" ||
        status === "confirmed";
      return {
        paid,
        internalPaymentId: extractDeep(data, [
          "merchantOrderId",
          "merchant_order_id",
          "orderId",
          "payment_id",
        ]),
        externalId: extractDeep(data, ["transactionId", "transaction_id", "id"]),
        transactionId: extractDeep(data, ["transactionId", "id"]),
      };
    },
  };
}
