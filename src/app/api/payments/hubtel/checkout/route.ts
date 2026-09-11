import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentGatewayConfig } from "@/lib/settings";
import { initiateHubtelCheckout, HubtelError } from "@/lib/payments/hubtel";

/** Hosted Hubtel checkout for online orders (card or mobile money, customer's choice on Hubtel's page). */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const orderNumber = typeof body?.orderNumber === "string" ? body.orderNumber : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";

  if (!orderNumber || !phone) {
    return NextResponse.json({ error: "Order number and phone are required." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { customer: true, payments: { where: { gateway: "HUBTEL" }, orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!order || order.customer?.phone !== phone) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const pendingPayment = order.payments[0];
  if (!pendingPayment || pendingPayment.status !== "PENDING") {
    return NextResponse.json({ error: "This order does not have a pending Hubtel payment." }, { status: 400 });
  }

  const config = await getPaymentGatewayConfig();
  if (!config.hubtel.enabled) {
    return NextResponse.json({ error: "Hubtel is not enabled." }, { status: 400 });
  }

  const origin = request.nextUrl.origin;
  try {
    const { checkoutUrl } = await initiateHubtelCheckout({
      clientId: config.hubtel.clientId,
      clientSecret: config.hubtel.clientSecret,
      merchantAccountNumber: config.hubtel.merchantAccountNumber,
      amountGHS: order.totalAmount,
      description: `FudFactory order ${order.orderNumber}`,
      clientReference: order.orderNumber,
      callbackUrl: `${origin}/api/payments/hubtel/callback`,
      returnUrl: `${origin}/order/${order.orderNumber}?phone=${encodeURIComponent(phone)}`,
      cancellationUrl: `${origin}/order/${order.orderNumber}?phone=${encodeURIComponent(phone)}&paymentFailed=1`,
    });
    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    const message = err instanceof HubtelError ? err.message : "Could not start Hubtel checkout.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
