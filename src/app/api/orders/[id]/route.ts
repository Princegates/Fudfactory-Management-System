import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";

const ALLOWED_ROLES = ["SUPER_ADMIN"];

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getStaffSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Only a super admin can delete orders." }, { status: 403 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  await prisma.$transaction([
    prisma.loyaltyTransaction.deleteMany({ where: { orderId: id } }),
    prisma.review.deleteMany({ where: { orderId: id } }),
    prisma.payment.deleteMany({ where: { orderId: id } }),
    prisma.delivery.deleteMany({ where: { orderId: id } }),
    prisma.orderItem.deleteMany({ where: { orderId: id } }),
    prisma.order.delete({ where: { id } }),
  ]);

  await logAudit({
    userId: session.id,
    action: "ORDER_DELETE",
    entityType: "Order",
    entityId: id,
    details: { orderNumber: order.orderNumber },
  });

  return NextResponse.json({ ok: true });
}
