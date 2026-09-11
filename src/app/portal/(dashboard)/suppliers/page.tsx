import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { QuickCreateForm } from "@/components/portal/QuickCreateForm";

export default async function SuppliersPage() {
  await requireStaff(["SUPER_ADMIN", "OWNER_MANAGER", "INVENTORY_OFFICER"]);
  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
    include: { inventoryItems: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-cocoa-900">Suppliers</h1>
        <QuickCreateForm
          action="/api/suppliers"
          buttonLabel="+ New Supplier"
          fields={[
            { name: "name", label: "Supplier name", required: true },
            { name: "phone", label: "Phone" },
            { name: "email", label: "Email", type: "email" },
            { name: "address", label: "Address" },
            { name: "itemsSupplied", label: "Items supplied (comma-separated)" },
          ]}
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-100 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-brand-100 text-left text-cocoa-900/50">
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Email</th>
              <th className="p-3">Items Supplied</th>
              <th className="p-3 text-right">Linked Items</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id} className="border-b border-brand-50">
                <td className="p-3 font-medium text-cocoa-900">{s.name}</td>
                <td className="p-3">{s.phone ?? "—"}</td>
                <td className="p-3">{s.email ?? "—"}</td>
                <td className="p-3">{s.itemsSupplied ?? "—"}</td>
                <td className="p-3 text-right">{s.inventoryItems.length}</td>
              </tr>
            ))}
            {suppliers.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-cocoa-900/50">No suppliers yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
