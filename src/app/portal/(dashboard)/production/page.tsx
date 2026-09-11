import Link from "next/link";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { ProductionForm } from "@/components/portal/ProductionForm";

export default async function ProductionPage() {
  await requireStaff(["SUPER_ADMIN", "OWNER_MANAGER", "PRODUCTION_OFFICER"]);

  const [orders, recipes] = await Promise.all([
    prisma.productionOrder.findMany({
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.recipe.findMany({ include: { product: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-cocoa-900">Production</h1>
        <ProductionForm
          recipes={recipes.map((r) => ({ id: r.id, name: r.name, productId: r.productId, productName: r.product.name }))}
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-100 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-brand-100 text-left text-cocoa-900/50">
              <th className="p-3">Code</th>
              <th className="p-3">Planned</th>
              <th className="p-3">Status</th>
              <th className="p-3">Items</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-brand-50">
                <td className="p-3">
                  <Link href={`/portal/production/${order.id}`} className="font-medium text-brand-700 hover:underline">
                    {order.code}
                  </Link>
                </td>
                <td className="p-3">{formatDate(order.plannedDate)}</td>
                <td className="p-3">{order.status}</td>
                <td className="p-3">{order.items.map((i) => `${i.product.name} x${i.quantityPlanned}`).join(", ")}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-cocoa-900/50">No production orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
