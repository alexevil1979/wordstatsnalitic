import { createHmac, createHash } from "crypto";
import type { PaymentDriver, WebhookParseResult } from "../types";
import { appBaseUrl, cfg, cfgBool, cfgNum, chargeWithCommission, extractDeep } from "../utils";

const WEBHOOK_IPS = new Set([
  "168.119.157.136",
  "168.119.60.227",
  "178.154.197.79",
  "51.250.54.238",
]);

const FAMILY = ["freekassa", "freekassa_sbp", "freekassa_card", "freekassa_world_card"];

export function isFreekassaFamily(code: string) {
  return FAMILY.includes(code.toLowerCase());
}

function defaultMethod(code: string): number | null {
  return (
    {
      freekassa_sbp: 44,
      freekassa_card: 36,
      freekassa_world_card: 32,
    } as Record<string, number>
  )[code] ?? null;
}

function makeApiSignature(payload: Record<string, unknown>, apiKey: string) {
  const data = { ...payload };
  delete data.signature;
  const keys = Object.keys(data).sort();
  const values = keys.map((k) => {
    const v = data[k];
    if (typeof v === "boolean") return v ? "1" : "0";
    return String(v);
  });
  return createHmac("sha256", apiKey).update(values.join("|")).digest("hex");
}

export function createFreekassaDriver(code: string): PaymentDriver {
  return {
    code,

    async createPayment(payment, config) {
      const shopId = cfgNum(config, "shop_id", 0);
      const apiKey = cfg(config, "api_key");
      const base = cfg(config, "api_base_url", "https://api.fk.life/v1").replace(/\/$/, "");
      const path = cfg(config, "api_create_path", "/orders/create");
      if (shopId <= 0 || !apiKey) throw new Error("FREEKASSA_MISSING_CONFIG");

      const method = cfgNum(config, "payment_method", 0) || defaultMethod(code);
      if (!method) throw new Error("FREEKASSA_MISSING_PAYMENT_METHOD");

      let amount = chargeWithCommission(payment.amount, config);
      let currency = cfg(config, "currency", payment.currency || "RUB").toUpperCase();
      if (code === "freekassa_world_card") {
        const rate = Number(process.env.USD_RUB_RATE || "90");
        amount = Math.round((amount / rate) * 100) / 100;
        currency = "USD";
      }

      const payload: Record<string, unknown> = {
        shopId,
        nonce: Date.now(),
        paymentId: payment.id,
        i: method,
        email: payment.userEmail || `user-${payment.userId.slice(0, 8)}@wordstat.local`,
        ip: cfg(config, "fallback_ip", "8.8.8.8"),
        amount: Number(amount.toFixed(2)),
        currency,
        notification_url: `${appBaseUrl()}/api/billing/webhook/freekassa`,
        success_url: `${appBaseUrl()}/api/billing/return?payment=${payment.id}`,
        failure_url: `${appBaseUrl()}/ru/cabinet?billing=cancel`,
      };
      payload.signature = makeApiSignature(payload, apiKey);

      const res = await fetch(`${base}${path.startsWith("/") ? path : `/${path}`}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as Record<string, unknown>;
      if (!res.ok) throw new Error(`FREEKASSA_HTTP_${res.status}`);

      const url =
        extractDeep(data, ["location", "Location", "data.location", "url", "payment_url"]) ||
        (() => {
          const orderId = extractDeep(data, ["orderId", "order_id", "data.orderId"]);
          const orderHash = extractDeep(data, ["orderHash", "order_hash", "data.orderHash"]);
          return orderId && orderHash
            ? `https://pay.freekassa.net/form/${orderId}/${orderHash}`
            : null;
        })();
      if (!url) throw new Error("FREEKASSA_BAD_RESPONSE");
      payment.externalId = extractDeep(data, ["orderId", "order_id", "data.orderId"]);
      return url;
    },

    async verifyWebhook(req, config) {
      if (cfgBool(config, "verify_webhook_ip", true)) {
        const ip =
          req.headers.get("cf-connecting-ip") ||
          req.headers.get("x-real-ip") ||
          (req.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() ||
          "";
        if (ip && !WEBHOOK_IPS.has(ip)) return false;
      }
      const secret = cfg(config, "secret_word_2");
      if (!secret) return cfgBool(config, "test_mode", false);
      const form = await req.clone().formData().catch(() => null);
      const get = (k: string) =>
        form?.get(k)?.toString() ||
        new URL(req.url).searchParams.get(k) ||
        "";
      // Also try JSON
      let merchantId = get("MERCHANT_ID");
      let amount = get("AMOUNT");
      let orderId = get("MERCHANT_ORDER_ID");
      let sign = get("SIGN").toLowerCase();
      if (!merchantId) {
        try {
          const json = (await req.clone().json()) as Record<string, string>;
          merchantId = String(json.MERCHANT_ID || "");
          amount = String(json.AMOUNT || "");
          orderId = String(json.MERCHANT_ORDER_ID || "");
          sign = String(json.SIGN || "").toLowerCase();
        } catch {
          /* ignore */
        }
      }
      if (!merchantId || !amount || !orderId || !sign) return false;
      const shop = cfg(config, "shop_id");
      if (shop && merchantId !== shop) return false;
      const calc = createHash("md5")
        .update(`${merchantId}:${amount}:${secret}:${orderId}`)
        .digest("hex");
      return calc === sign;
    },

    async parseWebhook(req): Promise<WebhookParseResult> {
      const form = await req.clone().formData().catch(() => null);
      const get = (k: string) => form?.get(k)?.toString() || "";
      let amount = get("AMOUNT");
      let internal = get("MERCHANT_ORDER_ID");
      let external = get("intid");
      if (!internal) {
        try {
          const json = (await req.json()) as Record<string, string>;
          amount = String(json.AMOUNT || "");
          internal = String(json.MERCHANT_ORDER_ID || "");
          external = String(json.intid || "");
        } catch {
          /* ignore */
        }
      }
      return {
        paid: Boolean(amount && internal),
        internalPaymentId: internal || null,
        externalId: external || null,
        transactionId: external || null,
        ackBody: "YES",
      };
    },
  };
}
