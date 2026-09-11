import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentGatewayConfig } from "@/lib/settings";
import { verifyPaystackTransaction } from "@/lib/payments/paystack";
import { finalizeGatewayPayment } from "@/lib/orders";

/**
 * Paystack redirects the customer's browser here after checkout. This is a
 * best-effort UX redirect, not the source of truth — the webhook below is
 * what reliably confirms payment even if the customer closes the tab before
 * this loads. Always re-verifies with Paystack rather than trusting query params.
 */
export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference") ?? request.nextUrl.searchParams.get("trxref");
  const origin = request.nextUrl.origin;

  if (!reference) {
    return NextResponse.redirect(`${origin}/cart?paymentError=1`);
  }

  const order = await prisma.order.findUnique({ where: { orderNumber: reference }, include: { customer: true } });
  if (!order) {
    return NextResponse.redirect(`${origin}/cart?paymentError=1`);
  }

  const config = await getPaymentGatewayConfig();
  const phoneParam = order.customer ? `?phone=${encodeURIComponent(order.customer.phone)}` : "";

  try {
    const verification = await verifyPaystackTransaction(config.paystack.secretKey, reference);
    await finalizeGatewayPayment({
      gateway: "PAYSTACK",
      gatewayReference: reference,
      outcome: verification.status === "success" ? "SUCCESSFUL" : "FAILED",
      gatewayMeta: verification,
    });
    const suffix = verification.status === "success" ? "" : "&paymentFailed=1";
    return NextResponse.redirect(`${origin}/order/${order.orderNumber}${phoneParam}${phoneParam ? suffix : `?paymentFailed=1`}`);
  } catch {
    return NextResponse.redirect(`${origin}/order/${order.orderNumber}${phoneParam}${phoneParam ? "&paymentFailed=1" : "?paymentFailed=1"}`);
  }
}
