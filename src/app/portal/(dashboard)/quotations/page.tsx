import Link from "next/link";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function QuotationsPage() {
  await requireStaff(["SUPER_ADMIN", "OWNER_MANAGER"]);
  const quotations = await prisma.quotation.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div>
      <h1 className="text-2xl font-bold text-cocoa-900">Quotations</h1>
      <p className="mt-1 text-sm text-cocoa-900/60">Custom &amp; event order requests from the website.</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-100 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-brand-100 text-left text-cocoa-900/50">
              <th className="p-3">Code</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Event</th>
              <th className="p-3">Requested</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((q) => (
              <tr key={q.id} className="border-b border-brand-50">
                <td className="p-3">
                  <Link href={`/portal/quotations/${q.code}`} className="font-medium text-brand-700 hover:underline">
                    {q.code}
                  </Link>
                </td>
                <td className="p-3">{q.customerName} · {q.phone}</td>
                <td className="p-3">{q.eventType}</td>
                <td className="p-3">{formatDate(q.createdAt)}</td>
                <td className="p-3">{q.status}</td>
                <td className="p-3 text-right">{formatCurrency(q.totalAmount)}</td>
              </tr>
            ))}
            {quotations.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-cocoa-900/50">No quotation requests yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
