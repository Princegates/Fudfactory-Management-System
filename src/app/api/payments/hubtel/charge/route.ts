import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/session";
import { getPaymentGatewayConfig } from "@/lib/settings";
import { createOrder } from "@/lib/orders";
import { chargeHubtelMobileMoney, HubtelError, HUBTEL_MOMO_CHANNELS } from "@/lib/payments/hubtel";

const ALLOWED_ROLES = ["SUPER_ADMIN", "OWNER_MANAGER", "CASHIER"];
const VALID_CHANNELS = new Set(HUBTEL_MOMO_CHANNELS.map((c) => c.value));

/**
 * POS in-person mobile money charge: creates the sale, then immediately
 * prompts the customer's phone for a MoMo PIN via Hubtel. The POS UI polls
 * /api/payments/status/[orderNumber] for the outcome — Hubtel confirms the
 * final result asynchronously via the callback route.
 */
export async function POST(request: NextRequest) {
  const session = await getStaffSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const lines = Array.isArray(body?.lines) ? body.lines : [];
  const customerName = typeof body?.customerName === "string" ? body.customerName.trim() : "";
  const customerMsisdn = typeof body?.customerMsisdn === "string" ? body.customerMsisdn.trim() : "";
  const channel = body?.channel;

  if (lines.length === 0) return NextResponse.json({ error: "Add at least one item to the sale." }, { status: 400 });
  if (!customerMsisdn) return NextResponse.json({ error: "A mobile money number is required." }, { status: 400 });
  if (!VALID_CHANNELS.has(channel)) return NextResponse.json({ error: "Select a valid mobile money network." }, { status: 400 });

  const config = await getPaymentGatewayConfig();
  if (!config.hubtel.enabled) return NextResponse.json({ error: "Hubtel is not enabled." }, { status: 400 });

  let order;
  try {
    order = await createOrder({
      channel: "POS",
      lines: lines.map((l: { productId: string; quantity: number }) => ({ productId: l.productId, quantity: l.quantity })),
      fulfillmentType: "PICKUP",
      paymentMethod: "MOBILE_MONEY",
      cashierId: session.id,
      gateway: "HUBTEL",
      customer: customerName || customerMsisdn ? { name: customerName || "Walk-in Customer", phone: customerMsisdn } : undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create sale.";
    return NextResponse.json({ error: message }, { status: 409 });
  }

  const origin = request.nextUrl.origin;
  try {
    const charge = await chargeHubtelMobileMoney({
      clientId: config.hubtel.clientId,
      clientSecret: config.hubtel.clientSecret,
      merchantAccountNumber: config.hubtel.merchantAccountNumber,
      customerName: customerName || "Walk-in Customer",
      customerMsisdn,
      channel,
      amountGHS: order.totalAmount,
      clientReference: order.orderNumber,
      callbackUrl: `${origin}/api/payments/hubtel/callback`,
      description: `FudFactory order ${order.orderNumber}`,
    });
    return NextResponse.json({ orderNumber: order.orderNumber, totalAmount: order.totalAmount, hubtelStatus: charge.status });
  } catch (err) {
    const message = err instanceof HubtelError ? err.message : "Could not start the mobile money charge.";
    // The order already exists (inventory reserved); staff can retry the
    // charge or cancel the order from the Orders screen.
    return NextResponse.json({ error: message, orderNumber: order.orderNumber }, { status: 502 });
  }
}
