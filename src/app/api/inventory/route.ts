import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";

const ALLOWED_ROLES = ["SUPER_ADMIN", "OWNER_MANAGER", "INVENTORY_OFFICER"];

export async function POST(request: NextRequest) {
  const session = await getStaffSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const sku = typeof body?.sku === "string" ? body.sku.trim() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const itemType = body?.itemType === "FINISHED_PRODUCT" ? "FINISHED_PRODUCT" : "RAW_MATERIAL";
  const unit = typeof body?.unit === "string" ? body.unit.trim() : "";
  const costPerUnit = Number(body?.costPerUnit) || 0;
  const minStock = Number(body?.minStock) || 0;
  const maxStock = body?.maxStock ? Number(body.maxStock) : undefined;
  const supplierId = typeof body?.supplierId === "string" && body.supplierId ? body.supplierId : undefined;
  const productId = typeof body?.productId === "string" && body.productId ? body.productId : undefined;

  if (!sku || !name || !unit) {
    return NextResponse.json({ error: "SKU, name and unit are required." }, { status: 400 });
  }

  try {
    const item = await prisma.inventoryItem.create({
      data: { sku, name, itemType, unit, costPerUnit, minStock, maxStock, supplierId, productId },
    });
    await logAudit({ userId: session.id, action: "INVENTORY_ITEM_CREATE", entityType: "InventoryItem", entityId: item.id });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "An item with this SKU already exists." }, { status: 409 });
  }
}
