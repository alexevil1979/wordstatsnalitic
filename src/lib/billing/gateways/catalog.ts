/** Gateway catalog aligned with fullvpnservice HiddifySalesSeeder + specialized configs. */

export type ConfigField = {
  key: string;
  label: string;
  type?: "text" | "password" | "number" | "toggle";
  placeholder?: string;
  defaultValue?: string | number | boolean;
  help?: string;
};

export type GatewayDef = {
  code: string;
  name: string;
  /** Prefer for zh locale (crypto / CN-friendly). */
  cnFriendly?: boolean;
  internal?: boolean;
  fields: ConfigField[];
};

const commonCommission: ConfigField[] = [
  {
    key: "extra_commission_percent",
    label: "Extra commission %",
    type: "number",
    defaultValue: 0,
  },
];

export const GATEWAY_CATALOG: GatewayDef[] = [
  {
    code: "yookassa",
    name: "ЮKassa",
    fields: [
      ...commonCommission,
      { key: "shop_id", label: "Shop ID" },
      { key: "secret_key", label: "Secret key", type: "password" },
      { key: "webhook_secret", label: "Webhook secret (optional)", type: "password" },
    ],
  },
  {
    code: "tinkoff",
    name: "Tinkoff / T-Bank",
    fields: [
      ...commonCommission,
      { key: "terminal_key", label: "Terminal key" },
      { key: "secret_key", label: "Secret key", type: "password" },
    ],
  },
  {
    code: "sber",
    name: "Сбербанк Эквайринг",
    fields: [
      ...commonCommission,
      { key: "username", label: "Username" },
      { key: "password", label: "Password", type: "password" },
      { key: "api_base_url", label: "API base URL", defaultValue: "https://ecommerce.sberbank.ru/ecomm/gw/partner/api/v1" },
    ],
  },
  {
    code: "robokassa",
    name: "Robokassa",
    fields: [
      ...commonCommission,
      { key: "merchant_login", label: "Merchant login" },
      { key: "password1", label: "Password #1", type: "password" },
      { key: "password2", label: "Password #2", type: "password" },
    ],
  },
  {
    code: "cloudpayments",
    name: "CloudPayments",
    fields: [
      ...commonCommission,
      { key: "public_id", label: "Public ID" },
      { key: "api_secret", label: "API secret", type: "password" },
    ],
  },
  {
    code: "qiwi",
    name: "QIWI",
    fields: [
      ...commonCommission,
      { key: "secret_key", label: "Secret key", type: "password" },
      { key: "phone", label: "Phone pool (manual top-up)" },
    ],
  },
  {
    code: "stripe",
    name: "Stripe",
    fields: [
      ...commonCommission,
      { key: "secret_key", label: "Secret key", type: "password", help: "Or use STRIPE_SECRET_KEY env" },
      { key: "webhook_secret", label: "Webhook secret", type: "password" },
      { key: "price_id", label: "Price ID (subscription)", help: "Or STRIPE_PRICE_PRO / plan stripePriceId" },
      { key: "mode", label: "Mode: subscription | payment", defaultValue: "subscription" },
    ],
  },
  {
    code: "paypal",
    name: "PayPal",
    fields: [
      ...commonCommission,
      { key: "client_id", label: "Client ID" },
      { key: "client_secret", label: "Client secret", type: "password" },
      { key: "mode", label: "Mode: live | sandbox", defaultValue: "sandbox" },
    ],
  },
  {
    code: "nowpayments",
    name: "NOWPayments",
    cnFriendly: true,
    fields: [
      ...commonCommission,
      { key: "api_key", label: "API key", type: "password" },
      { key: "ipn_secret", label: "IPN secret", type: "password" },
      { key: "pay_currency", label: "Pay currency", defaultValue: "usdttrc20" },
    ],
  },
  {
    code: "webmoney",
    name: "WebMoney",
    fields: [
      ...commonCommission,
      { key: "purse", label: "Purse" },
      { key: "secret_key", label: "Secret key", type: "password" },
    ],
  },
  {
    code: "overpay",
    name: "Overpay (SBP / fps)",
    fields: [
      ...commonCommission,
      { key: "merchant_id", label: "Merchant ID" },
      { key: "secret", label: "Secret", type: "password" },
      { key: "api_username", label: "API username" },
      { key: "api_password", label: "API password", type: "password" },
      { key: "certificate_path", label: "Certificate path", defaultValue: "app/private/overpay/client.pfx" },
      { key: "certificate_password", label: "Certificate password", type: "password" },
      { key: "api_base_url", label: "API base URL", defaultValue: "https://api-pay.overpay.io" },
      { key: "payment_method", label: "Payment method", defaultValue: "fps" },
      { key: "project_id", label: "Project ID" },
    ],
  },
  {
    code: "overpay_card",
    name: "Overpay (card)",
    fields: [
      ...commonCommission,
      { key: "merchant_id", label: "Merchant ID" },
      { key: "secret", label: "Secret", type: "password" },
      { key: "api_username", label: "API username" },
      { key: "api_password", label: "API password", type: "password" },
      { key: "certificate_path", label: "Certificate path", defaultValue: "app/private/overpay/client.pfx" },
      { key: "certificate_password", label: "Certificate password", type: "password" },
      { key: "api_base_url", label: "API base URL", defaultValue: "https://api-pay.overpay.io" },
      { key: "payment_method", label: "Payment method", defaultValue: "card" },
      { key: "project_id", label: "Project ID" },
    ],
  },
  {
    code: "exnode",
    name: "Exnode",
    cnFriendly: true,
    fields: [
      ...commonCommission,
      { key: "api_base_url", label: "API base URL", defaultValue: "https://my.exnode.io" },
      { key: "api_public", label: "ApiPublic" },
      { key: "api_private", label: "ApiPrivate", type: "password" },
      { key: "merchant_uuid", label: "Merchant UUID" },
      { key: "token", label: "Token", defaultValue: "USDTTRC" },
    ],
  },
  {
    code: "pally",
    name: "Pally.info (PayPalych)",
    fields: [
      ...commonCommission,
      { key: "shop_id", label: "Shop ID" },
      { key: "api_token", label: "API token", type: "password" },
    ],
  },
  {
    code: "oneplat",
    name: "1Plat.cash",
    fields: [
      ...commonCommission,
      { key: "shop_id", label: "Shop ID" },
      { key: "secret_key", label: "Secret key", type: "password" },
      { key: "api_base_url", label: "API base URL", defaultValue: "https://1plat.cash" },
    ],
  },
  {
    code: "platega",
    name: "Platega",
    fields: [
      ...commonCommission,
      { key: "api_base_url", label: "API base URL", defaultValue: "https://app.platega.io" },
      { key: "api_create_path", label: "Create path", defaultValue: "/v2/transaction/process" },
      { key: "merchant_id", label: "X-MerchantId" },
      { key: "secret", label: "X-Secret", type: "password" },
      { key: "command", label: "Command", defaultValue: "process" },
      { key: "currency", label: "Currency", defaultValue: "RUB" },
      { key: "payment_method", label: "Payment method (optional)" },
      { key: "webhook_token_key", label: "Webhook token key" },
      { key: "webhook_token_value", label: "Webhook token value", type: "password" },
    ],
  },
  {
    code: "freekassa_sbp",
    name: "FreeKassa (СБП / QR)",
    fields: freekassaFields(44),
  },
  {
    code: "freekassa_card",
    name: "FreeKassa (карты РФ)",
    fields: freekassaFields(36),
  },
  {
    code: "freekassa_world_card",
    name: "FreeKassa (VISA / MasterCard USD)",
    fields: freekassaFields(32),
  },
  {
    code: "friendlypay_card",
    name: "Friendly Pay (карты)",
    fields: friendlyFields("card"),
  },
  {
    code: "friendlypay_sbp",
    name: "Friendly Pay (СБП)",
    fields: friendlyFields("sbp"),
  },
  {
    code: "betatransfer",
    name: "BetaTransfer",
    fields: [
      ...commonCommission,
      { key: "api_base_url", label: "API base URL", defaultValue: "https://merchant.betatransfer.io/api" },
      { key: "token", label: "API public token", type: "password" },
      { key: "secret_key", label: "API secret key", type: "password" },
      { key: "payment_system", label: "Default paymentSystem", defaultValue: "Card4" },
      { key: "locale", label: "Locale", defaultValue: "ru" },
      { key: "signature_mode", label: "Signature mode", defaultValue: "all_post" },
    ],
  },
  {
    code: "bybit_direct",
    name: "Bybit Direct (USDT)",
    cnFriendly: true,
    fields: [
      ...commonCommission,
      { key: "sub_member_id", label: "Bybit Sub UID" },
      { key: "receive_uid", label: "Receive UID" },
      { key: "api_key", label: "Main API key", type: "password" },
      { key: "api_secret", label: "Main API secret", type: "password" },
      { key: "default_asset", label: "Default asset", defaultValue: "usdt_trc20" },
      { key: "deposit_address", label: "Deposit address (USDT TRC20)" },
    ],
  },
  {
    code: "boosty",
    name: "Boosty",
    fields: [
      ...commonCommission,
      { key: "page_slug", label: "Boosty page slug" },
      { key: "description_for_users", label: "Description for users" },
    ],
  },
];

function freekassaFields(defaultMethod: number): ConfigField[] {
  return [
    ...commonCommission,
    { key: "api_base_url", label: "API base URL", defaultValue: "https://api.fk.life/v1" },
    { key: "api_create_path", label: "Create path", defaultValue: "/orders/create" },
    { key: "shop_id", label: "Shop ID", type: "number" },
    { key: "api_key", label: "API key", type: "password" },
    { key: "secret_word_2", label: "Secret word 2 (webhook)", type: "password" },
    { key: "payment_method", label: "Payment method ID (i)", type: "number", defaultValue: defaultMethod },
    { key: "currency", label: "Currency", defaultValue: "RUB" },
    { key: "fallback_ip", label: "Fallback payer IP", defaultValue: "8.8.8.8" },
    { key: "verify_webhook_ip", label: "Verify webhook IP", type: "toggle", defaultValue: true },
  ];
}

function friendlyFields(txType: "card" | "sbp"): ConfigField[] {
  return [
    ...commonCommission,
    { key: "api_base_url", label: "API base URL", defaultValue: "https://pay.friendlypay.io/api" },
    { key: "api_token", label: "API token", type: "password" },
    { key: "secret_key", label: "HMAC secret (optional)", type: "password" },
    { key: "transaction_type", label: "Transaction type", defaultValue: txType },
    { key: "signature_encoding", label: "Signature encoding", defaultValue: "hex" },
    { key: "amount_in_minor_units", label: "Amount in minor units", type: "toggle", defaultValue: true },
    { key: "currency", label: "Currency", defaultValue: "RUB" },
  ];
}

export function getGatewayDef(code: string): GatewayDef | undefined {
  return GATEWAY_CATALOG.find((g) => g.code === code);
}

export function webhookPath(code: string): string {
  const family =
    code.startsWith("freekassa")
      ? "freekassa"
      : code.startsWith("friendlypay")
        ? "friendlypay"
        : code.startsWith("overpay")
          ? "overpay"
          : code;
  return `/api/billing/webhook/${family}`;
}
