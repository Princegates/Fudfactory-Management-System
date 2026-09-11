import Link from "next/link";
import { requireCustomer } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { CustomerLogoutButton } from "@/components/site/CustomerLogoutButton";

export default async function AccountDashboardPage() {
  const session = await requireCustomer();
  const customer = await prisma.customer.findUnique({
    where: { id: session.id },
    include: { orders: { orderBy: { createdAt: "desc" }, take: 3 } },
  });
  if (!customer) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-cocoa-900">Hi, {customer.name.split(" ")[0]}</h1>
        <CustomerLogoutButton />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-brand-100 bg-white p-5 text-center">
          <p className="text-2xl font-bold text-brand-700">{customer.loyaltyPoints}</p>
          <p className="text-sm text-cocoa-900/60">Loyalty points</p>
        </div>
        <div className="rounded-2xl border border-brand-100 bg-white p-5 text-center">
          <p className="text-2xl font-bold text-brand-700">{formatCurrency(customer.totalPurchases)}</p>
          <p className="text-sm text-cocoa-900/60">Total spent</p>
        </div>
        <div className="rounded-2xl border border-brand-100 bg-white p-5 text-center">
          <p className="text-2xl font-bold text-brand-700">{customer.segment}</p>
          <p className="text-sm text-cocoa-900/60">Customer tier</p>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-xl font-bold text-cocoa-900">Recent orders</h2>
        <Link href="/account/orders" className="text-sm font-semibold text-brand-600 hover:underline">
          View all →
        </Link>
      </div>
      {customer.orders.length > 0 ? (
        <ul className="mt-4 divide-y divide-brand-100 rounded-2xl border border-brand-100 bg-white">
          {customer.orders.map((order) => (
            <li key={order.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold text-cocoa-900">{order.orderNumber}</p>
                <p className="text-sm text-cocoa-900/60">{order.status.replace(/_/g, " ")}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-cocoa-900">{formatCurrency(order.totalAmount)}</p>
                <Link
                  href={`/order/${order.orderNumber}?phone=${encodeURIComponent(customer.phone)}`}
                  className="text-sm text-brand-600 hover:underline"
                >
                  Track
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-cocoa-900/60">
          No orders yet — <Link href="/menu" className="text-brand-600 hover:underline">browse the menu</Link>.
        </p>
      )}
    </div>
  );
}
