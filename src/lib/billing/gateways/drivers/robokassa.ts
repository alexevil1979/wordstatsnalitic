import { createHash } from "crypto";
import type { PaymentDriver, WebhookParseResult } from "../types";
import { appBaseUrl, cfg, chargeWithCommission } from "../utils";

export const robokassaDriver: PaymentDriver = {
  code: "robokassa",

  async createPayment(payment, config) {
    const login = cfg(config, "merchant_login");
    const pass1 = cfg(config, "password1");
    if (!login || !pass1) throw new Error("ROBOKASSA_MISSING_CONFIG");
    const outSum = chargeWithCommission(payment.amount, config).toFixed(2);
    const invId = payment.id.replace(/\D/g, "").slice(-9) || "1";
    // Store mapping in meta via invId — use payment.id in Shp_payment
    const signature = createHash("md5")
      .update(`${login}:${outSum}:${invId}:${pass1}:Shp_payment=${payment.id}`)
      .digest("hex");
    const params = new URLSearchParams({
      MerchantLogin: login,
      OutSum: outSum,
      InvId: invId,
      Description: `Wordstat Pro`,
      SignatureValue: signature,
      Shp_payment: payment.id,
      IsTest: config.test_mode ? "1" : "0",
      SuccessURL: `${appBaseUrl()}/api/billing/return?payment=${payment.id}`,
      FailURL: `${appBaseUrl()}/ru/cabinet?billing=cancel`,
    });
    payment.externalId = invId;
    return `https://auth.robokassa.ru/Merchant/Index.aspx?${params.toString()}`;
  },

  async verifyWebhook(req, config) {
    const pass2 = cfg(config, "password2");
    if (!pass2) return false;
    const form = await req.clone().formData().catch(() => null);
    const get = (k: string) =>
      form?.get(k)?.toString() || new URL(req.url).searchParams.get(k) || "";
    const outSum = get("OutSum");
    const invId = get("InvId");
    const shp = get("Shp_payment");
    const sig = get("SignatureValue").toLowerCase();
    const calc = createHash("md5")
      .update(`${outSum}:${invId}:${pass2}:Shp_payment=${shp}`)
      .digest("hex");
    return calc === sig;
  },

  async parseWebhook(req): Promise<WebhookParseResult> {
    const form = await req.clone().formData().catch(() => null);
    const get = (k: string) =>
      form?.get(k)?.toString() || new URL(req.url).searchParams.get(k) || "";
    const paymentId = get("Shp_payment");
    return {
      paid: Boolean(paymentId && get("OutSum")),
      internalPaymentId: paymentId || null,
      externalId: get("InvId") || null,
      transactionId: get("InvId") || null,
      ackBody: `OK${get("InvId")}`,
    };
  },
};
