import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/session";
import { createOrder } from "@/lib/orders";

const ALLOWED_ROLES = ["SUPER_ADMIN", "OWNER_MANAGER", "CASHIER"];

export async function POST(request: NextRequest) {
  const session = await getStaffSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const lines = Array.isArray(body?.lines) ? body.lines : [];
  const paymentMethod = ["CASH", "MOBILE_MONEY", "CARD", "BANK_TRANSFER", "ONLINE"].includes(body?.paymentMethod)
    ? body.paymentMethod
    : "CASH";
  const customerName = typeof body?.customerName === "string" ? body.customerName.trim() : "";
  const customerPhone = typeof body?.customerPhone === "string" ? body.customerPhone.trim() : "";
  const transactionRef = typeof body?.transactionRef === "string" && body.transactionRef.trim() ? body.transactionRef.trim() : undefined;

  if (lines.length === 0) {
    return NextResponse.json({ error: "Add at least one item to the sale." }, { status: 400 });
  }

  try {
    const order = await createOrder({
      channel: "POS",
      lines: lines.map((l: { productId: string; quantity: number }) => ({
        productId: l.productId,
        quantity: l.quantity,
      })),
      fulfillmentType: "PICKUP",
      paymentMethod,
      cashierId: session.id,
      transactionRef,
      customer: customerPhone ? { name: customerName || "Walk-in Customer", phone: customerPhone } : undefined,
    });

    return NextResponse.json({ orderNumber: order.orderNumber, id: order.id, totalAmount: order.totalAmount });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not complete sale.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
