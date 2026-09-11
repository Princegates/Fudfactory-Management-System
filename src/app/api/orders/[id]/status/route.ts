import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/session";
import { reverseInventoryForOrder, completeOrderCrmEffects } from "@/lib/sales";
import { logAudit } from "@/lib/audit";

const VALID_STATUSES = [
  "NEW",
  "CONFIRMED",
  "PROCESSING",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
  "REJECTED",
  "PARTIALLY_FULFILLED",
];

const RESTOCKING_STATUSES = ["CANCELLED", "REJECTED", "REFUNDED"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = body?.status;
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const wasCompleted = order.status === "COMPLETED";

  const updated = await prisma.order.update({ where: { id }, data: { status } });

  // Business rule: cancelled/rejected/refunded orders must not permanently
  // hold reduced inventory.
  if (RESTOCKING_STATUSES.includes(status)) {
    await reverseInventoryForOrder(order.id, order.orderNumber, session.id);
    if (status === "REFUNDED") {
      await prisma.payment.updateMany({ where: { orderId: order.id }, data: { status: "REFUNDED" } });
      await prisma.order.update({ where: { id }, data: { paymentStatus: "REFUNDED" } });
    }
  }

  if (status === "COMPLETED" && !wasCompleted) {
    await prisma.$transaction((tx) => completeOrderCrmEffects(tx, order.id));
  }

  await logAudit({
    userId: session.id,
    action: "ORDER_STATUS_CHANGE",
    entityType: "Order",
    entityId: order.id,
    details: { from: order.status, to: status },
  });

  return NextResponse.json({ status: updated.status });
}
