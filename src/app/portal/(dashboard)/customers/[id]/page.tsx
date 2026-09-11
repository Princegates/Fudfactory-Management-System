import { notFound } from "next/navigation";
import Link from "next/link";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { CustomerSegmentEditor } from "@/components/portal/CustomerSegmentEditor";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff(["SUPER_ADMIN", "OWNER_MANAGER", "CASHIER"]);
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: { orderBy: { createdAt: "desc" }, take: 20 },
      loyaltyTransactions: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!customer) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-cocoa-900">{customer.name}</h1>
        <CustomerSegmentEditor customerId={customer.id} currentSegment={customer.segment} />
      </div>
      <p className="mt-1 text-sm text-cocoa-900/60">{customer.phone} {customer.email ? `· ${customer.email}` : ""}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-brand-100 bg-white p-5 text-center">
          <p className="text-xl font-bold text-brand-700">{formatCurrency(customer.totalPurchases)}</p>
          <p className="text-sm text-cocoa-900/60">Total spent</p>
        </div>
        <div className="rounded-2xl border border-brand-100 bg-white p-5 text-center">
          <p className="text-xl font-bold text-brand-700">{customer.loyaltyPoints}</p>
          <p className="text-sm text-cocoa-900/60">Loyalty points</p>
        </div>
        <div className="rounded-2xl border border-brand-100 bg-white p-5 text-center">
          <p className="text-xl font-bold text-brand-700">{customer.orders.length}</p>
          <p className="text-sm text-cocoa-900/60">Orders</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-brand-100 bg-white p-5">
        <h2 className="font-bold text-cocoa-900">Order History</h2>
        <ul className="mt-3 divide-y divide-brand-50">
          {customer.orders.map((order) => (
            <li key={order.id} className="flex items-center justify-between py-2 text-sm">
              <Link href={`/portal/orders/${order.id}`} className="font-medium text-brand-700 hover:underline">
                {order.orderNumber}
              </Link>
              <span className="text-cocoa-900/60">{formatDate(order.createdAt)}</span>
              <span>{order.status.replace(/_/g, " ")}</span>
              <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
            </li>
          ))}
          {customer.orders.length === 0 && <p className="py-3 text-sm text-cocoa-900/50">No orders yet.</p>}
        </ul>
      </div>

      <div className="mt-6 rounded-2xl border border-brand-100 bg-white p-5">
        <h2 className="font-bold text-cocoa-900">Loyalty Activity</h2>
        <ul className="mt-3 divide-y divide-brand-50">
          {customer.loyaltyTransactions.map((tx) => (
            <li key={tx.id} className="flex items-center justify-between py-2 text-sm">
              <span>{tx.description}</span>
              <span className={tx.type === "REDEEM" ? "text-red-600" : "text-green-600"}>
                {tx.type === "REDEEM" ? "-" : "+"}{tx.points} pts
              </span>
            </li>
          ))}
          {customer.loyaltyTransactions.length === 0 && <p className="py-3 text-sm text-cocoa-900/50">No loyalty activity yet.</p>}
        </ul>
      </div>
    </div>
  );
}
