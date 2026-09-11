import { NextRequest, NextResponse } from "next/server";
import { getPaymentGatewayConfig } from "@/lib/settings";
import { verifyPaystackWebhookSignature, verifyPaystackTransaction } from "@/lib/payments/paystack";
import { finalizeGatewayPayment } from "@/lib/orders";

/**
 * Server-to-server confirmation from Paystack — the reliable source of
 * truth for payment status (unlike the browser callback redirect, which the
 * customer could close before it loads). Configure this URL
 * (<origin>/api/payments/paystack/webhook) in the Paystack dashboard.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  const config = await getPaymentGatewayConfig();
  if (!config.paystack.enabled || !config.paystack.secretKey) {
    return NextResponse.json({ error: "Paystack not configured." }, { status: 400 });
  }

  if (!verifyPaystackWebhookSignature(config.paystack.secretKey, rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const reference: string | undefined = event?.data?.reference;

  if (event?.event === "charge.success" && reference) {
    // Re-verify with Paystack rather than trusting the webhook payload
    // directly, per Paystack's own recommendation.
    try {
      const verification = await verifyPaystackTransaction(config.paystack.secretKey, reference);
      await finalizeGatewayPayment({
        gateway: "PAYSTACK",
        gatewayReference: reference,
        outcome: verification.status === "success" ? "SUCCESSFUL" : "FAILED",
        gatewayMeta: verification,
      });
    } catch {
      // Paystack retries webhooks on non-2xx; returning 200 anyway here
      // would silently drop a real failure, so surface it as a 502.
      return NextResponse.json({ error: "Verification failed." }, { status: 502 });
    }
  }

  return NextResponse.json({ received: true });
}
