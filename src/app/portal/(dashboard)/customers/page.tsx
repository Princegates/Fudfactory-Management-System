import Link from "next/link";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";

export default async function PortalCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; segment?: string }>;
}) {
  await requireStaff(["SUPER_ADMIN", "OWNER_MANAGER", "CASHIER"]);
  const { q, segment } = await searchParams;

  const customers = await prisma.customer.findMany({
    where: {
      ...(segment ? { segment: segment as never } : {}),
      ...(q
        ? { OR: [{ name: { contains: q } }, { phone: { contains: q } }, { email: { contains: q } }] }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const segments = ["NEW", "REGULAR", "VIP", "CORPORATE", "EVENT", "INACTIVE"];

  return (
    <div>
      <h1 className="text-2xl font-bold text-cocoa-900">Customers / CRM</h1>

      <form className="mt-4 flex flex-wrap gap-3" action="/portal/customers">
        <input name="q" defaultValue={q} placeholder="Search name, phone, email..." className="rounded-lg border border-brand-200 px-3 py-2 text-sm" />
        <select name="segment" defaultValue={segment ?? ""} className="rounded-lg border border-brand-200 px-3 py-2 text-sm">
          <option value="">All segments</option>
          {segments.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">Filter</button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-100 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-brand-100 text-left text-cocoa-900/50">
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Segment</th>
              <th className="p-3 text-right">Total Spent</th>
              <th className="p-3 text-right">Loyalty Points</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-brand-50 hover:bg-brand-50/50">
                <td className="p-3">
                  <Link href={`/portal/customers/${c.id}`} className="font-medium text-brand-700 hover:underline">
                    {c.name}
                  </Link>
                </td>
                <td className="p-3">{c.phone}</td>
                <td className="p-3">{c.segment}</td>
                <td className="p-3 text-right">{formatCurrency(c.totalPurchases)}</td>
                <td className="p-3 text-right">{c.loyaltyPoints}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-cocoa-900/50">No customers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
