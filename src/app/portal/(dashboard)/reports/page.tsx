import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { StatCard } from "@/components/portal/StatCard";

export default async function ReportsPage() {
  await requireStaff(["SUPER_ADMIN", "OWNER_MANAGER"]);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [orders, expenseAgg, bestSellers, salesByChannel] = await Promise.all([
    prisma.order.findMany({ where: { createdAt: { gte: startOfMonth }, status: { not: "CANCELLED" } } }),
    prisma.expense.aggregate({ _sum: { amount: true }, where: { expenseDate: { gte: startOfMonth } } }),
    prisma.orderItem.groupBy({ by: ["productName"], _sum: { quantity: true, subtotal: true }, orderBy: { _sum: { subtotal: "desc" } }, take: 10 }),
    prisma.order.groupBy({ by: ["channel"], _sum: { totalAmount: true }, _count: true, where: { createdAt: { gte: startOfMonth }, status: { not: "CANCELLED" } } }),
  ]);

  const revenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const expenses = expenseAgg._sum.amount ?? 0;
  const grossProfit = revenue - expenses;

  const reports = [
    { label: "Sales Report", href: "/api/reports/sales" },
    { label: "Customer Report", href: "/api/reports/customers" },
    { label: "Expense Report", href: "/api/reports/expenses" },
    { label: "Inventory Report", href: "/api/reports/inventory" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-cocoa-900">Reports &amp; Analytics</h1>
      <p className="mt-1 text-sm text-cocoa-900/60">Showing figures for the current month.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Revenue (MTD)" value={formatCurrency(revenue)} />
        <StatCard label="Expenses (MTD)" value={formatCurrency(expenses)} />
        <StatCard label="Estimated Gross Profit" value={formatCurrency(grossProfit)} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-brand-100 bg-white p-5">
          <h2 className="font-bold text-cocoa-900">Top Products (by revenue)</h2>
          <table className="mt-3 w-full text-sm">
            <tbody>
              {bestSellers.map((item) => (
                <tr key={item.productName} className="border-b border-brand-50">
                  <td className="py-2">{item.productName}</td>
                  <td className="py-2 text-right">{item._sum.quantity} sold</td>
                  <td className="py-2 text-right font-semibold">{formatCurrency(item._sum.subtotal ?? 0)}</td>
                </tr>
              ))}
              {bestSellers.length === 0 && <tr><td className="py-3 text-cocoa-900/50">No sales this month yet.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-white p-5">
          <h2 className="font-bold text-cocoa-900">Online vs Physical Sales</h2>
          <table className="mt-3 w-full text-sm">
            <tbody>
              {salesByChannel.map((row) => (
                <tr key={row.channel} className="border-b border-brand-50">
                  <td className="py-2">{row.channel === "ONLINE" ? "Online" : "POS (Physical)"}</td>
                  <td className="py-2 text-right">{row._count} orders</td>
                  <td className="py-2 text-right font-semibold">{formatCurrency(row._sum.totalAmount ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-brand-100 bg-white p-5">
        <h2 className="font-bold text-cocoa-900">Download Reports (CSV)</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {reports.map((r) => (
            <a
              key={r.href}
              href={r.href}
              className="rounded-full border border-brand-300 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
            >
              {r.label} ↓
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
