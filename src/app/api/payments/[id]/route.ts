import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";

const ALLOWED_ROLES = ["SUPER_ADMIN", "OWNER_MANAGER", "CASHIER"];
const STATUSES = ["PENDING", "SUCCESSFUL", "FAILED", "REFUNDED", "PARTIALLY_PAID"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getStaffSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!STATUSES.includes(body?.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const payment = await prisma.payment.update({
    where: { id },
    data: { status: body.status, paidAt: body.status === "SUCCESSFUL" ? new Date() : undefined },
  });
  await prisma.order.update({ where: { id: payment.orderId }, data: { paymentStatus: body.status } });

  await logAudit({ userId: session.id, action: "PAYMENT_STATUS_CHANGE", entityType: "Payment", entityId: id, details: { status: body.status } });

  return NextResponse.json(payment);
}
