import Link from "next/link";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { PaymentStatusSelect } from "@/components/portal/PaymentStatusSelect";

export default async function PaymentsPage() {
  await requireStaff(["SUPER_ADMIN", "OWNER_MANAGER", "CASHIER"]);

  const payments = await prisma.payment.findMany({
    include: { order: true, customer: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-cocoa-900">Payments</h1>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-100 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-brand-100 text-left text-cocoa-900/50">
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Method</th>
              <th className="p-3">Date</th>
              <th className="p-3 text-right">Amount</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-brand-50">
                <td className="p-3">
                  <Link href={`/portal/orders/${p.orderId}`} className="font-medium text-brand-700 hover:underline">
                    {p.order.orderNumber}
                  </Link>
                </td>
                <td className="p-3">{p.customer?.name ?? "Walk-in"}</td>
                <td className="p-3">{p.method.replace(/_/g, " ")}</td>
                <td className="p-3">{formatDate(p.createdAt)}</td>
                <td className="p-3 text-right">{formatCurrency(p.amount)}</td>
                <td className="p-3"><PaymentStatusSelect paymentId={p.id} status={p.status} /></td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-cocoa-900/50">No payments recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
