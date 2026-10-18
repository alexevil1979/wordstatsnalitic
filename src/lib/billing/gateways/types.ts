export type GatewayConfig = Record<string, string | number | boolean | null | undefined>;

export type PaymentRow = {
  id: string;
  userId: string;
  gateway: string;
  amount: number;
  currency: string;
  status: string;
  externalId: string | null;
  planId: string;
  meta: Record<string, unknown>;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Filled for createPayment helpers */
  userEmail?: string | null;
};

export type WebhookParseResult = {
  paid: boolean;
  internalPaymentId?: string | null;
  externalId?: string | null;
  transactionId?: string | null;
  /** FreeKassa expects plain text ACK like "YES" */
  ackBody?: string;
};

export interface PaymentDriver {
  code: string;
  createPayment(payment: PaymentRow, cfg: GatewayConfig): Promise<string>;
  verifyWebhook(req: Request, cfg: GatewayConfig): Promise<boolean> | boolean;
  parseWebhook(req: Request, cfg: GatewayConfig): Promise<WebhookParseResult> | WebhookParseResult;
}

export type GatewayRow = {
  id: string;
  code: string;
  name: string;
  enabled: boolean;
  testMode: boolean;
  minAmountRub: number;
  config: GatewayConfig;
  updatedAt: string;
};
