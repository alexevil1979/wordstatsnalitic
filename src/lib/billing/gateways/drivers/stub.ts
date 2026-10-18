import type { PaymentDriver } from "../types";

/** Placeholder for gateways that need certs / polling (Overpay, Exnode, Bybit, …). */
export function stubDriver(code: string): PaymentDriver {
  return {
    code,
    async createPayment() {
      throw new Error(
        `${code.toUpperCase()}_NOT_IMPLEMENTED: сохраните ключи в админке; полный драйвер как в fullvpnservice подключается по запросу (сертификаты/поллинг).`
      );
    },
    verifyWebhook() {
      return false;
    },
    parseWebhook() {
      return { paid: false };
    },
  };
}
