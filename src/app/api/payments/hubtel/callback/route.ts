import { NextRequest, NextResponse } from "next/server";
import { finalizeGatewayPayment } from "@/lib/orders";

const SUCCESS_STATUSES = new Set(["paid", "success", "successful"]);
const FAILURE_STATUSES = new Set(["unpaid", "failed", "cancelled", "canceled"]);

/**
 * Hubtel's async postback for both the direct mobile-money charge
 * (PrimaryCallbackUrl) and the hosted checkout (callbackUrl). The exact
 * payload shape varies by product, so this parses defensively across the
 * field-name variants Hubtel is known to use. Configure this URL
 * (<origin>/api/payments/hubtel/callback) wherever Hubtel asks for it.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body." }, { status: 400 });

  const data = body.Data ?? body.data ?? body;
  const reference: string | undefined = data.ClientReference ?? data.clientReference ?? data.OrderId ?? data.orderId;
  const rawStatus: string = String(data.Status ?? data.status ?? body.ResponseCode ?? body.responseCode ?? "").toLowerCase();

  if (!reference) return NextResponse.json({ error: "Missing client reference." }, { status: 400 });

  let outcome: "SUCCESSFUL" | "FAILED" | null = null;
  if (SUCCESS_STATUSES.has(rawStatus) || rawStatus === "0000") outcome = "SUCCESSFUL";
  else if (FAILURE_STATUSES.has(rawStatus) || rawStatus === "2001") outcome = "FAILED";

  if (outcome) {
    await finalizeGatewayPayment({ gateway: "HUBTEL", gatewayReference: reference, outcome, gatewayMeta: body });
  }
  // If the status is ambiguous/still pending, acknowledge without changing
  // state — a later, more definitive callback or the status-check poll will
  // resolve it.

  return NextResponse.json({ received: true });
}
