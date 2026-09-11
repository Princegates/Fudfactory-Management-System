import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { DeliveryRowControls } from "@/components/portal/DeliveryRowControls";

export default async function DeliveriesPage() {
  await requireStaff(["SUPER_ADMIN", "OWNER_MANAGER", "DELIVERY_OFFICER"]);

  const [deliveries, riders] = await Promise.all([
    prisma.delivery.findMany({
      include: { order: { include: { customer: true } }, rider: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.user.findMany({ where: { role: "DELIVERY_OFFICER", isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-cocoa-900">Deliveries</h1>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-100 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-brand-100 text-left text-cocoa-900/50">
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Location</th>
              <th className="p-3 text-right">Fee</th>
              <th className="p-3">Scheduled</th>
              <th className="p-3">Rider / Status</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((d) => (
              <tr key={d.id} className="border-b border-brand-50">
                <td className="p-3 font-medium text-cocoa-900">{d.order.orderNumber}</td>
                <td className="p-3">{d.order.customer?.name ?? "Guest"}</td>
                <td className="p-3">{d.deliveryLocation}</td>
                <td className="p-3 text-right">{formatCurrency(d.deliveryFee)}</td>
                <td className="p-3">{d.scheduledAt ? formatDate(d.scheduledAt) : "—"}</td>
                <td className="p-3">
                  <DeliveryRowControls deliveryId={d.id} status={d.status} riderId={d.riderId} riders={riders} />
                </td>
              </tr>
            ))}
            {deliveries.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-cocoa-900/50">No deliveries yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
