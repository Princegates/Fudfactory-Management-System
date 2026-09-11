import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/orders";
import { getCustomerSession } from "@/lib/session";

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

  if (!name || !phone) {
    return NextResponse.json({ error: "Name and phone number are required." }, { status: 400 });
  }
  if (lines.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }
  if (fulfillmentType === "DELIVERY" && !deliveryAddress) {
    return NextResponse.json({ error: "A delivery address is required." }, { status: 400 });
  }

  const session = await getCustomerSession();

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
      customer: { id: session?.id, name, phone, email },
    });

    return NextResponse.json({ orderNumber: order.orderNumber });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not place order.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
