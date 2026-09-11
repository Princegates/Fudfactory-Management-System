import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentGatewayConfig } from "@/lib/settings";
import { initializePaystackTransaction, PaystackError } from "@/lib/payments/paystack";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const orderNumber = typeof body?.orderNumber === "string" ? body.orderNumber : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";

  if (!orderNumber || !phone) {
    return NextResponse.json({ error: "Order number and phone are required." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { customer: true, payments: { where: { gateway: "PAYSTACK" }, orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!order || order.customer?.phone !== phone) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const pendingPayment = order.payments[0];
  if (!pendingPayment || pendingPayment.status !== "PENDING") {
    return NextResponse.json({ error: "This order does not have a pending Paystack payment." }, { status: 400 });
  }

  const config = await getPaymentGatewayConfig();
  if (!config.paystack.enabled) {
    return NextResponse.json({ error: "Paystack is not enabled." }, { status: 400 });
  }

  const email = order.customer?.email || `guest+${order.orderNumber}@fudfactory.gh`;
  const origin = request.nextUrl.origin;

  try {
    const { authorizationUrl } = await initializePaystackTransaction({
      secretKey: config.paystack.secretKey,
      email,
      amountGHS: order.totalAmount,
      reference: order.orderNumber,
      callbackUrl: `${origin}/api/payments/paystack/callback`,
    });
    return NextResponse.json({ authorizationUrl });
  } catch (err) {
    const message = err instanceof PaystackError ? err.message : "Could not start Paystack checkout.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
