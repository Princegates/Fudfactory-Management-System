import Link from "next/link";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function PortalOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireStaff(["SUPER_ADMIN", "OWNER_MANAGER", "CASHIER", "DELIVERY_OFFICER"]);
  const { status, q } = await searchParams;

  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(q
        ? {
            OR: [
              { orderNumber: { contains: q } },
              { customer: { name: { contains: q } } },
              { customer: { phone: { contains: q } } },
            ],
          }
        : {}),
    },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const statuses = [
    "NEW", "CONFIRMED", "PROCESSING", "PREPARING", "READY", "OUT_FOR_DELIVERY",
    "DELIVERED", "COMPLETED", "CANCELLED", "REFUNDED", "REJECTED", "PARTIALLY_FULFILLED",
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-cocoa-900">Orders</h1>

      <form className="mt-4 flex flex-wrap gap-3" action="/portal/orders">
        <input name="q" defaultValue={q} placeholder="Search order #, customer, phone..." className="rounded-lg border border-brand-200 px-3 py-2 text-sm" />
        <select name="status" defaultValue={status ?? ""} className="rounded-lg border border-brand-200 px-3 py-2 text-sm">
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
        <button className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">Filter</button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-100 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-brand-100 text-left text-cocoa-900/50">
              <th className="p-3">Order</th>
              <th className="p-3">Channel</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Status</th>
              <th className="p-3">Placed</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-brand-50 hover:bg-brand-50/50">
                <td className="p-3">
                  <Link href={`/portal/orders/${order.id}`} className="font-medium text-brand-700 hover:underline">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="p-3">{order.channel}</td>
                <td className="p-3">{order.customer?.name ?? "Walk-in"}</td>
                <td className="p-3">{order.status.replace(/_/g, " ")}</td>
                <td className="p-3">{formatDate(order.createdAt)}</td>
                <td className="p-3 text-right">{formatCurrency(order.totalAmount)}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-cocoa-900/50">No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
