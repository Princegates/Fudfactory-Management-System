import crypto from "crypto";

// https://paystack.com/docs/api/transaction/ — stable, well-documented REST API.
const PAYSTACK_BASE_URL = "https://api.paystack.co";

export class PaystackError extends Error {
  constructor(message: string, public readonly raw?: unknown) {
    super(message);
    this.name = "PaystackError";
  }
}

async function paystackRequest<T>(
  secretKey: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.status) {
    throw new PaystackError(body?.message ?? `Paystack request failed (${res.status})`, body);
  }
  return body.data as T;
}

/**
 * Starts a hosted-checkout transaction. Amount is in GHS (major units) —
 * Paystack expects the smallest currency unit (pesewas), so we multiply by
 * 100 here.
 */
export async function initializePaystackTransaction(params: {
  secretKey: string;
  email: string;
  amountGHS: number;
  reference: string;
  callbackUrl: string;
}): Promise<{ authorizationUrl: string; accessCode: string; reference: string }> {
  const data = await paystackRequest<{ authorization_url: string; access_code: string; reference: string }>(
    params.secretKey,
    "/transaction/initialize",
    {
      method: "POST",
      body: JSON.stringify({
        email: params.email,
        amount: Math.round(params.amountGHS * 100),
        currency: "GHS",
        reference: params.reference,
        callback_url: params.callbackUrl,
      }),
    },
  );
  return { authorizationUrl: data.authorization_url, accessCode: data.access_code, reference: data.reference };
}

export type PaystackVerification = {
  status: "success" | "failed" | "abandoned" | string;
  reference: string;
  amountGHS: number;
  channel: string;
  paidAt: string | null;
  gatewayResponse: string;
};

export async function verifyPaystackTransaction(
  secretKey: string,
  reference: string,
): Promise<PaystackVerification> {
  const data = await paystackRequest<{
    status: string;
    reference: string;
    amount: number;
    channel: string;
    paid_at: string | null;
    gateway_response: string;
  }>(secretKey, `/transaction/verify/${encodeURIComponent(reference)}`);

  return {
    status: data.status,
    reference: data.reference,
    amountGHS: data.amount / 100,
    channel: data.channel,
    paidAt: data.paid_at,
    gatewayResponse: data.gateway_response,
  };
}

/**
 * Verifies the `x-paystack-signature` header on an incoming webhook request:
 * HMAC-SHA512 of the raw request body, keyed with the account's secret key.
 * Must be computed over the raw (unparsed) body — parse JSON only after
 * this check passes.
 */
export function verifyPaystackWebhookSignature(secretKey: string, rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;
  const expected = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}
