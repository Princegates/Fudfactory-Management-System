import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/session";

const ALLOWED_ROLES = ["SUPER_ADMIN", "OWNER_MANAGER", "DELIVERY_OFFICER"];
const STATUSES = ["PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getStaffSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const data: Record<string, unknown> = {};
  if (STATUSES.includes(body?.status)) {
    data.status = body.status;
    if (body.status === "DELIVERED") data.deliveredAt = new Date();
  }
  if (typeof body?.riderId === "string") data.riderId = body.riderId || null;

  const delivery = await prisma.delivery.update({ where: { id }, data });

  if (data.status === "DELIVERED") {
    await prisma.order.update({ where: { id: delivery.orderId }, data: { status: "DELIVERED" } });
  }

  return NextResponse.json(delivery);
}
