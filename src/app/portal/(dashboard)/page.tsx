import Link from "next/link";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { StatCard } from "@/components/portal/StatCard";
import { SalesTrendChart } from "@/components/portal/SalesTrendChart";
import { getLowStockItems } from "@/lib/inventory";
import { navFor } from "@/lib/permissions";

export default async function PortalDashboardPage() {
  const session = await requireStaff();
  const isManager = session.role === "SUPER_ADMIN" || session.role === "OWNER_MANAGER";

  if (!isManager) {
    const items = navFor(session.role).filter((i) => i.href !== "/portal");
    return (
      <div>
        <h1 className="text-2xl font-bold text-cocoa-900">Welcome, {session.name}</h1>
        <p className="mt-1 text-cocoa-900/60">Here&apos;s what you can access as {session.role.replace(/_/g, " ")}.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-brand-100 bg-white p-5 font-semibold text-cocoa-900 shadow-sm transition hover:border-brand-300 hover:text-brand-600"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [todayOrders, totalCustomers, lowStock, pendingDeliveries, todayExpenses, recentOrders, weekOrders, bestSellers] =
    await Promise.all([
      prisma.order.findMany({ where: { createdAt: { gte: startOfToday }, status: { not: "CANCELLED" } } }),
      prisma.customer.count(),
      getLowStockItems(),
      prisma.delivery.count({ where: { status: { in: ["PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT"] } } }),
      prisma.expense.aggregate({ _sum: { amount: true }, where: { expenseDate: { gte: startOfToday } } }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { customer: true } }),
      prisma.order.findMany({
        where: { createdAt: { gte: sevenDaysAgo }, status: { not: "CANCELLED" } },
        select: { createdAt: true, totalAmount: true },
      }),
      prisma.orderItem.groupBy({
        by: ["productName"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
    ]);

  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const trendMap = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    trendMap.set(d.toLocaleDateString("en-GH", { weekday: "short" }), 0);
  }
  for (const order of weekOrders) {
    const key = order.createdAt.toLocaleDateString("en-GH", { weekday: "short" });
    trendMap.set(key, (trendMap.get(key) ?? 0) + order.totalAmount);
  }
  const trendData = Array.from(trendMap.entries()).map(([date, revenue]) => ({ date, revenue }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-cocoa-900">Welcome back, {session.name}</h1>
      <p className="mt-1 text-cocoa-900/60">Here&apos;s how FudFactory is doing today.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's Revenue" value={formatCurrency(todayRevenue)} hint={`${todayOrders.length} orders`} />
        <StatCard label="Total Customers" value={String(totalCustomers)} />
        <StatCard label="Pending Deliveries" value={String(pendingDeliveries)} />
        <StatCard label="Today's Expenses" value={formatCurrency(todayExpenses._sum.amount ?? 0)} />
      </div>

      {lowStock.length > 0 && (
        <div className="mt-6">
          <StatCard
            tone="warning"
            label="Low Stock Alerts"
            value={`${lowStock.length} item(s)`}
            hint={lowStock.slice(0, 4).map((i) => i.name).join(", ")}
          />
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="font-bold text-cocoa-900">Sales — Last 7 Days</h2>
          <div className="mt-4">
            <SalesTrendChart data={trendData} />
          </div>
        </div>
        <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-cocoa-900">Best Sellers</h2>
          <ul className="mt-4 space-y-3">
            {bestSellers.map((item) => (
              <li key={item.productName} className="flex items-center justify-between text-sm">
                <span className="text-cocoa-900">{item.productName}</span>
                <span className="font-semibold text-brand-700">{item._sum.quantity} sold</span>
              </li>
            ))}
            {bestSellers.length === 0 && <p className="text-sm text-cocoa-900/50">No sales yet.</p>}
          </ul>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-brand-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-cocoa-900">Recent Orders</h2>
          <Link href="/portal/orders" className="text-sm font-semibold text-brand-600 hover:underline">
            View all →
          </Link>
        </div>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-brand-100 text-left text-cocoa-900/50">
              <th className="py-2">Order</th>
              <th className="py-2">Customer</th>
              <th className="py-2">Status</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} className="border-b border-brand-50">
                <td className="py-2">
                  <Link href={`/portal/orders/${order.id}`} className="font-medium text-brand-700 hover:underline">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="py-2">{order.customer?.name ?? "Guest"}</td>
                <td className="py-2">{order.status.replace(/_/g, " ")}</td>
                <td className="py-2 text-right">{formatCurrency(order.totalAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
