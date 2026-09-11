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
  if (typeof body?.unit === "string") data.unit = body.unit.trim();
  if (typeof body?.costPerUnit === "number" && body.costPerUnit >= 0) data.costPerUnit = body.costPerUnit;
  if (typeof body?.minStock === "number" && body.minStock >= 0) data.minStock = body.minStock;
  if (typeof body?.supplierId === "string") data.supplierId = body.supplierId || null;

  const item = await prisma.inventoryItem.update({ where: { id }, data });
  return NextResponse.json(item);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getStaffSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { id } = await params;
  const item = await prisma.inventoryItem.findUnique({
    where: { id },
    include: { _count: { select: { recipeUses: true } } },
  });
  if (!item) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (item._count.recipeUses > 0) {
    return NextResponse.json({ error: "This item is used in a recipe — remove it from the recipe first." }, { status: 409 });
  }
  if (item.productId) {
    return NextResponse.json({ error: "This item is linked to a sellable product — unlink it first." }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.inventoryTransaction.deleteMany({ where: { itemId: id } }),
    prisma.inventoryItem.delete({ where: { id } }),
  ]);
  await logAudit({ userId: session.id, action: "INVENTORY_ITEM_DELETE", entityType: "InventoryItem", entityId: id });
  return NextResponse.json({ ok: true });
}
