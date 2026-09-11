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
    <div className="relative">
      <div className="aurora-bg opacity-30" />
      <div className="relative mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold" style={{ color: "var(--text-hi)" }}>
            Hi, <span className="text-gradient">{customer.name.split(" ")[0]}</span>
          </h1>
          <CustomerLogoutButton />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="glass rounded-2xl p-5 text-center">
            <p className="font-display text-2xl font-bold text-gradient">{customer.loyaltyPoints}</p>
            <p className="text-sm" style={{ color: "var(--text-lo)" }}>Loyalty points</p>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <p className="font-display text-2xl font-bold text-gradient">{formatCurrency(customer.totalPurchases)}</p>
            <p className="text-sm" style={{ color: "var(--text-lo)" }}>Total spent</p>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <p className="font-display text-2xl font-bold text-gradient">{customer.segment}</p>
            <p className="text-sm" style={{ color: "var(--text-lo)" }}>Customer tier</p>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold" style={{ color: "var(--text-hi)" }}>Recent orders</h2>
          <Link href="/account/orders" className="text-sm font-semibold hover:underline" style={{ color: "var(--glow-cyan)" }}>
            View all →
          </Link>
        </div>
        {customer.orders.length > 0 ? (
          <ul className="glass mt-4 divide-y rounded-2xl" style={{ borderColor: "var(--ink-border)" }}>
            {customer.orders.map((order) => (
              <li key={order.id} className="flex items-center justify-between p-4" style={{ borderColor: "var(--ink-border)" }}>
                <div>
                  <p className="font-semibold" style={{ color: "var(--text-hi)" }}>{order.orderNumber}</p>
                  <p className="text-sm" style={{ color: "var(--text-lo)" }}>{order.status.replace(/_/g, " ")}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold" style={{ color: "var(--text-hi)" }}>{formatCurrency(order.totalAmount)}</p>
                  <Link
                    href={`/order/${order.orderNumber}?phone=${encodeURIComponent(customer.phone)}`}
                    className="text-sm hover:underline"
                    style={{ color: "var(--glow-cyan)" }}
                  >
                    Track
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm" style={{ color: "var(--text-lo)" }}>
            No orders yet —{" "}
            <Link href="/menu" className="hover:underline" style={{ color: "var(--glow-amber)" }}>
              browse the menu
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
