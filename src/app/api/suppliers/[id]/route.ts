import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";

const ALLOWED_ROLES = ["SUPER_ADMIN", "OWNER_MANAGER", "INVENTORY_OFFICER"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getStaffSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const data: Record<string, unknown> = {};
  if (typeof body?.name === "string") data.name = body.name.trim();
  if (typeof body?.phone === "string") data.phone = body.phone.trim() || null;
  if (typeof body?.email === "string") data.email = body.email.trim() || null;
  if (typeof body?.address === "string") data.address = body.address.trim() || null;
  if (typeof body?.itemsSupplied === "string") data.itemsSupplied = body.itemsSupplied.trim() || null;

  const supplier = await prisma.supplier.update({ where: { id }, data });
  return NextResponse.json(supplier);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getStaffSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { id } = await params;
  await prisma.$transaction([
    prisma.inventoryItem.updateMany({ where: { supplierId: id }, data: { supplierId: null } }),
    prisma.supplier.delete({ where: { id } }),
  ]);
  await logAudit({ userId: session.id, action: "SUPPLIER_DELETE", entityType: "Supplier", entityId: id });
  return NextResponse.json({ ok: true });
}
