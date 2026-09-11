import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/session";

const ROLES = ["SUPER_ADMIN", "OWNER_MANAGER", "CASHIER", "INVENTORY_OFFICER", "PRODUCTION_OFFICER", "DELIVERY_OFFICER"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getStaffSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const data: Record<string, unknown> = {};
  if (ROLES.includes(body?.role)) data.role = body.role;
  if (typeof body?.isActive === "boolean") data.isActive = body.isActive;

  const user = await prisma.user.update({ where: { id }, data });
  return NextResponse.json({ id: user.id, role: user.role, isActive: user.isActive });
}
