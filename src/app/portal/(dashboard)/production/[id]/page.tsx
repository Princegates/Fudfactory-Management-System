import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { CompleteProductionButton } from "@/components/portal/CompleteProductionButton";

export default async function ProductionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff(["SUPER_ADMIN", "OWNER_MANAGER", "PRODUCTION_OFFICER"]);
  const { id } = await params;

  const order = await prisma.productionOrder.findUnique({
    where: { id },
    include: { items: { include: { product: true, recipe: true } } },
  });
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-cocoa-900">{order.code}</h1>
        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">{order.status}</span>
      </div>
      <p className="mt-1 text-sm text-cocoa-900/60">Planned: {formatDate(order.plannedDate)}</p>
      {order.notes && <p className="mt-1 text-sm text-cocoa-900/60">{order.notes}</p>}

      <div className="mt-6 rounded-2xl border border-brand-100 bg-white p-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-100 text-left text-cocoa-900/50">
              <th className="py-2">Product</th>
              <th className="py-2">Recipe</th>
              <th className="py-2 text-right">Planned</th>
              <th className="py-2 text-right">Produced</th>
              <th className="py-2 text-right">Est. Cost</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-brand-50">
                <td className="py-2">{item.product.name}</td>
                <td className="py-2">{item.recipe?.name ?? "—"}</td>
                <td className="py-2 text-right">{item.quantityPlanned}</td>
                <td className="py-2 text-right">{item.quantityProduced}</td>
                <td className="py-2 text-right">{formatCurrency(item.estimatedCost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {order.status !== "COMPLETED" && (
        <div className="mt-6">
          <CompleteProductionButton productionOrderId={order.id} />
          <p className="mt-2 text-xs text-cocoa-900/50">
            Completing will consume raw materials per recipe, increase finished-goods stock, and calculate the
            estimated production cost.
          </p>
        </div>
      )}
    </div>
  );
}
