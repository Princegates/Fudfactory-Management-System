import { prisma } from "./prisma";

/** Canonical keys for every setting stored in the generic Setting table. */
export const SETTING_KEYS = {
  // Payment gateways
  paystackEnabled: "payment.paystack.enabled",
  paystackSecretKey: "payment.paystack.secretKey",
  paystackPublicKey: "payment.paystack.publicKey",
  hubtelEnabled: "payment.hubtel.enabled",
  hubtelClientId: "payment.hubtel.clientId",
  hubtelClientSecret: "payment.hubtel.clientSecret",
  hubtelMerchantAccountNumber: "payment.hubtel.merchantAccountNumber",

  // Direct/manual mobile money — customer pays the business's own MoMo
  // number outside any gateway, then supplies the transaction ID for staff
  // to verify against their MoMo statement before confirming the payment.
  manualMomoEnabled: "payment.manualMomo.enabled",
  manualMomoNumber: "payment.manualMomo.number",
  manualMomoNetwork: "payment.manualMomo.network",
  manualMomoInstructions: "payment.manualMomo.instructions",

  // General / localization
  currencyCode: "general.currencyCode",
  currencySymbol: "general.currencySymbol",
  timezone: "general.timezone",

  // Site theme
  siteTheme: "site.theme",

  // Notifications
  notifSmsEnabled: "notifications.smsEnabled",
  notifEmailEnabled: "notifications.emailEnabled",
  notifWhatsappEnabled: "notifications.whatsappEnabled",

  // SMS gateway
  smsProvider: "sms.provider",
  smsApiKey: "sms.apiKey",
  smsSenderId: "sms.senderId",

  // Email (SMTP)
  smtpHost: "email.smtpHost",
  smtpPort: "email.smtpPort",
  smtpUser: "email.smtpUser",
  smtpPassword: "email.smtpPassword",
  smtpFromAddress: "email.fromAddress",

  // WhatsApp Business
  whatsappPhoneNumber: "whatsapp.phoneNumber",
  whatsappApiToken: "whatsapp.apiToken",

  // Receipts / printing
  receiptHeader: "receipts.header",
  receiptFooter: "receipts.footer",
  thermalPaperWidth: "receipts.thermalPaperWidthMm",

  // Captcha
  captchaEnabled: "captcha.enabled",
  captchaSiteKey: "captcha.siteKey",
  captchaSecretKey: "captcha.secretKey",
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

const SECRET_KEY_PATTERN = /secret|apikey|password|token/i;

export function isSecretKey(key: string): boolean {
  return SECRET_KEY_PATTERN.test(key);
}

export function maskSecret(value: string | null | undefined): string {
  if (!value) return "";
  if (value.length <= 4) return "••••";
  return `••••••••${value.slice(-4)}`;
}

export async function getSetting(key: string, fallback?: string): Promise<string | undefined> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? fallback;
}

export async function getSettings(keys: string[]): Promise<Record<string, string | undefined>> {
  const rows = await prisma.setting.findMany({ where: { key: { in: keys } } });
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const result: Record<string, string | undefined> = {};
  for (const key of keys) result[key] = map.get(key);
  return result;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

/** Batch upsert; skips keys whose value is undefined (so callers can pass a
 * partial form submission without clobbering unrelated settings). */
export async function setSettings(values: Record<string, string | undefined>): Promise<void> {
  const entries = Object.entries(values).filter((e): e is [string, string] => e[1] !== undefined);
  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } }),
    ),
  );
}

export type PaymentGatewayConfig = {
  paystack: { enabled: boolean; secretKey: string; publicKey: string };
  hubtel: { enabled: boolean; clientId: string; clientSecret: string; merchantAccountNumber: string };
};

/** Settings-table values win; falls back to env vars so a deploy can work
 * out of the box before anyone touches the Settings UI. */
export async function getPaymentGatewayConfig(): Promise<PaymentGatewayConfig> {
  const s = await getSettings([
    SETTING_KEYS.paystackEnabled,
    SETTING_KEYS.paystackSecretKey,
    SETTING_KEYS.paystackPublicKey,
    SETTING_KEYS.hubtelEnabled,
    SETTING_KEYS.hubtelClientId,
    SETTING_KEYS.hubtelClientSecret,
    SETTING_KEYS.hubtelMerchantAccountNumber,
  ]);

  const paystackSecretKey = s[SETTING_KEYS.paystackSecretKey] ?? process.env.PAYSTACK_SECRET_KEY ?? "";
  const paystackPublicKey = s[SETTING_KEYS.paystackPublicKey] ?? process.env.PAYSTACK_PUBLIC_KEY ?? "";
  const hubtelClientId = s[SETTING_KEYS.hubtelClientId] ?? process.env.HUBTEL_CLIENT_ID ?? "";
  const hubtelClientSecret = s[SETTING_KEYS.hubtelClientSecret] ?? process.env.HUBTEL_CLIENT_SECRET ?? "";
  const hubtelMerchantAccountNumber =
    s[SETTING_KEYS.hubtelMerchantAccountNumber] ?? process.env.HUBTEL_MERCHANT_ACCOUNT_NUMBER ?? "";

  return {
    paystack: {
      enabled: (s[SETTING_KEYS.paystackEnabled] ?? "false") === "true" && Boolean(paystackSecretKey),
      secretKey: paystackSecretKey,
      publicKey: paystackPublicKey,
    },
    hubtel: {
      enabled:
        (s[SETTING_KEYS.hubtelEnabled] ?? "false") === "true" &&
        Boolean(hubtelClientId && hubtelClientSecret && hubtelMerchantAccountNumber),
      clientId: hubtelClientId,
      clientSecret: hubtelClientSecret,
      merchantAccountNumber: hubtelMerchantAccountNumber,
    },
  };
}

export type ManualMomoConfig = { enabled: boolean; number: string; network: string; instructions: string };

export async function getManualMomoConfig(): Promise<ManualMomoConfig> {
  const s = await getSettings([
    SETTING_KEYS.manualMomoEnabled,
    SETTING_KEYS.manualMomoNumber,
    SETTING_KEYS.manualMomoNetwork,
    SETTING_KEYS.manualMomoInstructions,
  ]);
  const number = s[SETTING_KEYS.manualMomoNumber] ?? "";
  return {
    enabled: (s[SETTING_KEYS.manualMomoEnabled] ?? "false") === "true" && Boolean(number),
    number,
    network: s[SETTING_KEYS.manualMomoNetwork] ?? "MTN Mobile Money",
    instructions:
      s[SETTING_KEYS.manualMomoInstructions] ??
      "Send the exact order total to this number, then enter the transaction ID from your Mobile Money SMS below. We'll confirm it before your order is prepared.",
  };
}

export async function getCurrency(): Promise<{ code: string; symbol: string }> {
  const s = await getSettings([SETTING_KEYS.currencyCode, SETTING_KEYS.currencySymbol]);
  return {
    code: s[SETTING_KEYS.currencyCode] ?? "GHS",
    symbol: s[SETTING_KEYS.currencySymbol] ?? "GH₵",
  };
}
