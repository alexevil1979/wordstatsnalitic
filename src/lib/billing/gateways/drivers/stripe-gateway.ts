import Stripe from "stripe";
import { createCheckoutSession, getStripe } from "@/lib/billing/stripe";
import type { PaymentDriver, WebhookParseResult } from "../types";
import { appBaseUrl, cfg, chargeWithCommission } from "../utils";

export const stripeGatewayDriver: PaymentDriver = {
  code: "stripe",

  async createPayment(payment, config) {
    const mode = cfg(config, "mode", "subscription");
    const secret = cfg(config, "secret_key") || process.env.STRIPE_SECRET_KEY || "";
    if (!secret) throw new Error("STRIPE_MISSING");

    if (mode === "subscription") {
      // Reuse Auth.js user id from payment; locale from meta
      const locale = String(payment.meta.locale || "ru");
      const session = await createCheckoutSession(payment.userId, locale);
      if (!session.url) throw new Error("STRIPE_NO_URL");
      payment.externalId = session.id;
      return session.url;
    }

    const stripe = new Stripe(secret);
    const amount = chargeWithCommission(payment.amount, config);
    let currency = (payment.currency || "usd").toLowerCase();
    let unitAmount = Math.round(amount * 100);
    if (currency === "rub") {
      // keep RUB
    } else if (payment.currency === "RUB") {
      currency = "rub";
    } else {
      currency = "usd";
      const rate = Number(process.env.USD_RUB_RATE || "90");
      unitAmount = Math.round((amount / rate) * 100);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${appBaseUrl()}/api/billing/return?payment=${payment.id}`,
      cancel_url: `${appBaseUrl()}/${payment.meta.locale || "ru"}/cabinet?billing=cancel`,
      client_reference_id: payment.id,
      metadata: { payment_id: payment.id, userId: payment.userId },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: unitAmount,
            product_data: { name: "Wordstat Pro" },
          },
        },
      ],
    });
    if (!session.url) throw new Error("STRIPE_NO_URL");
    payment.externalId = session.id;
    return session.url;
  },

  async verifyWebhook(req, config) {
    const whSecret = cfg(config, "webhook_secret") || process.env.STRIPE_WEBHOOK_SECRET || "";
    if (!whSecret) return false;
    const stripe = getStripe() || new Stripe(cfg(config, "secret_key") || process.env.STRIPE_SECRET_KEY || "");
    const sig = req.headers.get("stripe-signature");
    if (!sig) return false;
    try {
      stripe.webhooks.constructEvent(await req.clone().text(), sig, whSecret);
      return true;
    } catch {
      return false;
    }
  },

  async parseWebhook(req): Promise<WebhookParseResult> {
    const json = (await req.json()) as {
      type?: string;
      data?: {
        object?: {
          id?: string;
          payment_status?: string;
          client_reference_id?: string;
          metadata?: { payment_id?: string; userId?: string };
          mode?: string;
        };
      };
    };
    const obj = json.data?.object || {};
    const paid =
      json.type === "checkout.session.completed" &&
      (obj.payment_status === "paid" || obj.mode === "subscription");
    return {
      paid: Boolean(paid),
      internalPaymentId: obj.client_reference_id || obj.metadata?.payment_id || null,
      externalId: obj.id || null,
      transactionId: obj.id || null,
    };
  },
};
