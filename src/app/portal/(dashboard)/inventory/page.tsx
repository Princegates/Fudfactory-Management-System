import Link from "next/link";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { NewInventoryItemForm } from "@/components/portal/NewInventoryItemForm";
import { InventoryItemRowControls } from "@/components/portal/InventoryItemRowControls";

export default async function InventoryPage() {
  await requireStaff(["SUPER_ADMIN", "OWNER_MANAGER", "INVENTORY_OFFICER"]);

  const [items, suppliers] = await Promise.all([
    prisma.inventoryItem.findMany({ orderBy: { name: "asc" }, include: { supplier: true } }),
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-cocoa-900">Inventory</h1>
        <NewInventoryItemForm suppliers={suppliers} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-100 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-brand-100 text-left text-cocoa-900/50">
              <th className="p-3">SKU</th>
              <th className="p-3">Name</th>
              <th className="p-3">Type</th>
              <th className="p-3 text-right">Stock</th>
              <th className="p-3">Supplier</th>
              <th className="p-3 text-right">Min Stock, Cost &amp; Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const low = item.currentStock <= item.minStock;
              return (
                <tr key={item.id} className={`border-b border-brand-50 ${low ? "bg-amber-50" : ""}`}>
                  <td className="p-3 font-mono text-xs">{item.sku}</td>
                  <td className="p-3">
                    <Link href={`/portal/inventory/${item.id}`} className="font-medium text-brand-700 hover:underline">
                      {item.name}
                    </Link>
                    {low && <span className="ml-2 rounded-full bg-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-800">Low stock</span>}
                  </td>
                  <td className="p-3">{item.itemType === "RAW_MATERIAL" ? "Raw Material" : "Finished Product"}</td>
                  <td className="p-3 text-right">{item.currentStock} {item.unit}</td>
                  <td className="p-3">{item.supplier?.name ?? "—"}</td>
                  <td className="p-3 text-right">
                    <InventoryItemRowControls itemId={item.id} minStock={item.minStock} costPerUnit={item.costPerUnit} />
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-cocoa-900/50">No inventory items yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
