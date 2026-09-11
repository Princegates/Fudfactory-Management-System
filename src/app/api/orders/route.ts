import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/orders";
import { getCustomerSession } from "@/lib/session";
import { getPaymentGatewayConfig } from "@/lib/settings";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

  const lines = Array.isArray(body.lines) ? body.lines : [];
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : undefined;
  const fulfillmentType = body.fulfillmentType === "DELIVERY" ? "DELIVERY" : "PICKUP";
  const deliveryAddress = typeof body.deliveryAddress === "string" ? body.deliveryAddress.trim() : undefined;
  const scheduledFor = typeof body.scheduledFor === "string" && body.scheduledFor ? new Date(body.scheduledFor) : undefined;
  const paymentMethod = ["CASH", "MOBILE_MONEY", "CARD", "BANK_TRANSFER", "ONLINE"].includes(body.paymentMethod)
    ? body.paymentMethod
    : "CASH";
  const promotionCode = typeof body.promotionCode === "string" && body.promotionCode.trim() ? body.promotionCode.trim() : undefined;
  const notes = typeof body.notes === "string" ? body.notes.trim() : undefined;
  const gatewayProvider = body.gatewayProvider === "PAYSTACK" || body.gatewayProvider === "HUBTEL" ? body.gatewayProvider : undefined;
  const transactionRef = typeof body.transactionRef === "string" && body.transactionRef.trim() ? body.transactionRef.trim() : undefined;

  if (!name || !phone) {
    return NextResponse.json({ error: "Name and phone number are required." }, { status: 400 });
  }
  if (lines.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }
  if (fulfillmentType === "DELIVERY" && !deliveryAddress) {
    return NextResponse.json({ error: "A delivery address is required." }, { status: 400 });
  }
  if (paymentMethod === "MOBILE_MONEY" && !gatewayProvider && !transactionRef) {
    return NextResponse.json(
      { error: "Enter the Mobile Money transaction ID so we can verify your payment." },
      { status: 400 },
    );
  }

  const session = await getCustomerSession();

  if (gatewayProvider) {
    const config = await getPaymentGatewayConfig();
    const enabled = gatewayProvider === "PAYSTACK" ? config.paystack.enabled : config.hubtel.enabled;
    if (!enabled) {
      return NextResponse.json({ error: `${gatewayProvider === "PAYSTACK" ? "Paystack" : "Hubtel"} is not available right now.` }, { status: 400 });
    }
  }

  try {
    const order = await createOrder({
      channel: "ONLINE",
      lines: lines.map((l: { productId: string; quantity: number; sizeLabel?: string }) => ({
        productId: l.productId,
        quantity: l.quantity,
        sizeLabel: l.sizeLabel,
      })),
      fulfillmentType,
      deliveryAddress,
      scheduledFor,
      paymentMethod,
      promotionCode,
      notes,
      gateway: gatewayProvider,
      transactionRef,
      customer: { id: session?.id, name, phone, email },
    });

    return NextResponse.json({ orderNumber: order.orderNumber, gateway: gatewayProvider ?? null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not place order.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
