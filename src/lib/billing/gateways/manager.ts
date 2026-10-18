import { betatransferDriver } from "./drivers/betatransfer";
import { createFreekassaDriver, isFreekassaFamily } from "./drivers/freekassa";
import { createFriendlyPayDriver, isFriendlyFamily } from "./drivers/friendlypay";
import { nowpaymentsDriver } from "./drivers/nowpayments";
import { paypalDriver } from "./drivers/paypal";
import { plategaDriver } from "./drivers/platega";
import { robokassaDriver } from "./drivers/robokassa";
import { stripeGatewayDriver } from "./drivers/stripe-gateway";
import { stubDriver } from "./drivers/stub";
import { yookassaDriver } from "./drivers/yookassa";
import type { PaymentDriver } from "./types";

export function getDriver(code: string): PaymentDriver {
  const c = code.toLowerCase();
  if (c === "yookassa") return yookassaDriver;
  if (c === "stripe") return stripeGatewayDriver;
  if (c === "nowpayments") return nowpaymentsDriver;
  if (c === "platega") return plategaDriver;
  if (c === "betatransfer") return betatransferDriver;
  if (c === "robokassa") return robokassaDriver;
  if (c === "paypal") return paypalDriver;
  if (isFreekassaFamily(c)) return createFreekassaDriver(c);
  if (isFriendlyFamily(c)) return createFriendlyPayDriver(c);
  return stubDriver(c);
}

export function webhookFamilyCodes(code: string): string[] {
  const c = code.toLowerCase();
  if (c === "freekassa" || isFreekassaFamily(c)) {
    return ["freekassa_sbp", "freekassa_card", "freekassa_world_card", "freekassa"];
  }
  if (c === "friendlypay" || isFriendlyFamily(c)) {
    return ["friendlypay_card", "friendlypay_sbp", "friendlypay"];
  }
  if (c === "overpay") return ["overpay", "overpay_card"];
  return [c];
}
