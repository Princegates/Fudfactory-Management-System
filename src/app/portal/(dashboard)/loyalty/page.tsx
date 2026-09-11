import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { QuickCreateForm } from "@/components/portal/QuickCreateForm";

export default async function LoyaltyPage() {
  await requireStaff(["SUPER_ADMIN", "OWNER_MANAGER"]);

  const topCustomers = await prisma.customer.findMany({
    where: { loyaltyPoints: { gt: 0 } },
    orderBy: { loyaltyPoints: "desc" },
    take: 20,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-cocoa-900">Loyalty Program</h1>
        <QuickCreateForm
          action="/api/loyalty/adjust"
          buttonLabel="+ Adjust Points"
          fields={[
            { name: "phone", label: "Customer phone", required: true },
            { name: "points", label: "Points (use - to deduct)", type: "number", required: true },
            { name: "description", label: "Reason" },
          ]}
        />
      </div>
      <p className="mt-1 text-sm text-cocoa-900/60">
        Customers earn 1 point per GHS 10 spent on completed orders. Rewards (discounts, free pastries,
        free delivery, birthday rewards) can be redeemed manually against a customer&apos;s balance.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-100 bg-white">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-brand-100 text-left text-cocoa-900/50">
              <th className="p-3">Customer</th>
              <th className="p-3">Phone</th>
              <th className="p-3 text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            {topCustomers.map((c) => (
              <tr key={c.id} className="border-b border-brand-50">
                <td className="p-3 font-medium text-cocoa-900">{c.name}</td>
                <td className="p-3">{c.phone}</td>
                <td className="p-3 text-right font-bold text-brand-700">{c.loyaltyPoints}</td>
              </tr>
            ))}
            {topCustomers.length === 0 && (
              <tr><td colSpan={3} className="p-6 text-center text-cocoa-900/50">No loyalty points earned yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
