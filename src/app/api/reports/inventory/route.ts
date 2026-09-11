import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/session";
import { csvResponse } from "@/lib/csv";

const ALLOWED_ROLES = ["SUPER_ADMIN", "OWNER_MANAGER", "INVENTORY_OFFICER"];

export async function GET() {
  const session = await getStaffSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return new Response("Not authorized", { status: 403 });
  }

  const items = await prisma.inventoryItem.findMany({ include: { supplier: true }, orderBy: { name: "asc" } });

  return csvResponse(
    "inventory-report.csv",
    items.map((i) => ({
      SKU: i.sku,
      Name: i.name,
      Type: i.itemType,
      Unit: i.unit,
      CurrentStock: i.currentStock,
      MinStock: i.minStock,
      CostPerUnit: i.costPerUnit,
      Supplier: i.supplier?.name ?? "",
    })),
  );
}
