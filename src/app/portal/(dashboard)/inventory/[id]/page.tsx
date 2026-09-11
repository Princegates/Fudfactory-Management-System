import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { StockMovementForm } from "@/components/portal/StockMovementForm";

export default async function InventoryItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff(["SUPER_ADMIN", "OWNER_MANAGER", "INVENTORY_OFFICER"]);
  const { id } = await params;

  const item = await prisma.inventoryItem.findUnique({
    where: { id },
    include: {
      supplier: true,
      product: true,
      transactions: { orderBy: { createdAt: "desc" }, take: 30, include: { user: true } },
    },
  });
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-cocoa-900">{item.name}</h1>
      <p className="text-sm text-cocoa-900/60">SKU: {item.sku} · {item.itemType === "RAW_MATERIAL" ? "Raw Material" : "Finished Product"}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-brand-100 bg-white p-5 text-center">
          <p className="text-xl font-bold text-brand-700">{item.currentStock} {item.unit}</p>
          <p className="text-sm text-cocoa-900/60">Current stock</p>
        </div>
        <div className="rounded-2xl border border-brand-100 bg-white p-5 text-center">
          <p className="text-xl font-bold text-brand-700">{item.minStock} {item.unit}</p>
          <p className="text-sm text-cocoa-900/60">Minimum level</p>
        </div>
        <div className="rounded-2xl border border-brand-100 bg-white p-5 text-center">
          <p className="text-xl font-bold text-brand-700">{item.costPerUnit}</p>
          <p className="text-sm text-cocoa-900/60">Cost / {item.unit}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-brand-100 bg-white p-5">
        <h2 className="font-bold text-cocoa-900">Record Movement</h2>
        <div className="mt-3">
          <StockMovementForm itemId={item.id} />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-brand-100 bg-white p-5">
        <h2 className="font-bold text-cocoa-900">Transaction History</h2>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-brand-100 text-left text-cocoa-900/50">
              <th className="py-2">Date</th>
              <th className="py-2">Type</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {item.transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-brand-50">
                <td className="py-2">{formatDate(tx.createdAt)}</td>
                <td className="py-2">{tx.type.replace(/_/g, " ")}</td>
                <td className={`py-2 text-right ${tx.quantity < 0 ? "text-red-600" : "text-green-600"}`}>
                  {tx.quantity > 0 ? "+" : ""}{tx.quantity}
                </td>
                <td className="py-2 text-cocoa-900/60">{tx.note ?? tx.reference ?? "—"}</td>
              </tr>
            ))}
            {item.transactions.length === 0 && (
              <tr><td colSpan={4} className="py-4 text-center text-cocoa-900/50">No movements yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
