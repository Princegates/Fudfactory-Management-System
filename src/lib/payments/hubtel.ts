// Hubtel payment integration.
//
// IMPORTANT: this sandboxed build environment cannot reach hubtel.com (all
// outbound network egress outside an allowlist is blocked here), so none of
// the calls in this file could be live-tested against Hubtel's real API
// during development. The endpoint paths and payload shapes below reflect
// Hubtel's published "Online Checkout" and "Receive Money (Mobile Money)"
// APIs as documented at https://developers.hubtel.com — verify them against
// the current developer portal and test with real sandbox credentials
// before going live. Every call surfaces Hubtel's raw response on failure
// so a mismatch is easy to diagnose rather than silently failing.

const HUBTEL_CHECKOUT_BASE_URL = "https://payproxyapi.hubtel.com";
const HUBTEL_RECEIVE_MONEY_BASE_URL = "https://rmsc.hubtel.com";

export class HubtelError extends Error {
  constructor(message: string, public readonly raw?: unknown) {
    super(message);
    this.name = "HubtelError";
  }
}

function basicAuthHeader(clientId: string, clientSecret: string): string {
  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
}

async function hubtelRequest<T>(
  baseUrl: string,
  path: string,
  clientId: string,
  clientSecret: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: basicAuthHeader(clientId, clientSecret),
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new HubtelError(body?.message ?? `Hubtel request failed (${res.status})`, body);
  }
  return body as T;
}

/** Mobile money network channels Hubtel recognises for direct charges. */
export const HUBTEL_MOMO_CHANNELS = [
  { value: "mtn-gh", label: "MTN Mobile Money" },
  { value: "vodafone-gh", label: "Telecel Cash (Vodafone)" },
  { value: "tigo-gh", label: "AirtelTigo Money" },
] as const;

/**
 * Hosted checkout page — used for online (web) checkout. Customer is
 * redirected to `checkoutUrl` to complete payment by card or mobile money.
 */
export async function initiateHubtelCheckout(params: {
  clientId: string;
  clientSecret: string;
  merchantAccountNumber: string;
  amountGHS: number;
  description: string;
  clientReference: string;
  callbackUrl: string;
  returnUrl: string;
  cancellationUrl: string;
}): Promise<{ checkoutUrl: string; checkoutId: string }> {
  const body = await hubtelRequest<{
    responseCode: string;
    data?: { checkoutUrl: string; checkoutId: string };
    message?: string;
  }>(HUBTEL_CHECKOUT_BASE_URL, "/items/initiate", params.clientId, params.clientSecret, {
    method: "POST",
    body: JSON.stringify({
      totalAmount: params.amountGHS,
      description: params.description,
      callbackUrl: params.callbackUrl,
      returnUrl: params.returnUrl,
      cancellationUrl: params.cancellationUrl,
      merchantAccountNumber: params.merchantAccountNumber,
      clientReference: params.clientReference,
    }),
  });

  if (!body.data) {
    throw new HubtelError(body.message ?? "Hubtel did not return a checkout URL.", body);
  }
  return body.data;
}

/**
 * Direct mobile money charge — prompts the customer's phone for a MoMo PIN
 * immediately, no redirect. Used for in-person POS sales. Hubtel confirms
 * the final result asynchronously via `PrimaryCallbackUrl`.
 */
export async function chargeHubtelMobileMoney(params: {
  clientId: string;
  clientSecret: string;
  merchantAccountNumber: string;
  customerName: string;
  customerMsisdn: string; // e.g. 0244123456
  channel: (typeof HUBTEL_MOMO_CHANNELS)[number]["value"];
  amountGHS: number;
  clientReference: string;
  callbackUrl: string;
  description: string;
}): Promise<{ status: string; transactionId?: string }> {
  const body = await hubtelRequest<{
    responseCode: string;
    status?: string;
    data?: { transactionId?: string };
    message?: string;
  }>(
    HUBTEL_RECEIVE_MONEY_BASE_URL,
    `/v1/merchantaccount/merchants/${encodeURIComponent(params.merchantAccountNumber)}/receive/mobilemoney`,
    params.clientId,
    params.clientSecret,
    {
      method: "POST",
      body: JSON.stringify({
        CustomerName: params.customerName,
        CustomerMsisdn: params.customerMsisdn,
        Channel: params.channel,
        Amount: params.amountGHS,
        PrimaryCallbackUrl: params.callbackUrl,
        Description: params.description,
        ClientReference: params.clientReference,
      }),
    },
  );

  return { status: body.status ?? body.responseCode ?? "Pending", transactionId: body.data?.transactionId };
}
