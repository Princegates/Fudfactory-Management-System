import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { QuickCreateForm } from "@/components/portal/QuickCreateForm";
import { StaffRowControls } from "@/components/portal/StaffRowControls";

const ROLE_OPTIONS = [
  { value: "SUPER_ADMIN", label: "Super Administrator" },
  { value: "OWNER_MANAGER", label: "Owner / Manager" },
  { value: "CASHIER", label: "Cashier" },
  { value: "INVENTORY_OFFICER", label: "Inventory Officer" },
  { value: "PRODUCTION_OFFICER", label: "Production Officer" },
  { value: "DELIVERY_OFFICER", label: "Delivery Officer" },
];

export default async function StaffPage() {
  await requireStaff(["SUPER_ADMIN"]);
  const staff = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-cocoa-900">Staff Management</h1>
        <QuickCreateForm
          action="/api/staff"
          buttonLabel="+ New Staff"
          fields={[
            { name: "name", label: "Full name", required: true },
            { name: "email", label: "Email", type: "email", required: true },
            { name: "phone", label: "Phone" },
            { name: "department", label: "Department" },
            { name: "role", label: "Role", type: "select", required: true, options: ROLE_OPTIONS },
            { name: "password", label: "Temporary password", type: "text", required: true },
          ]}
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-100 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-brand-100 text-left text-cocoa-900/50">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Department</th>
              <th className="p-3">Role / Status</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="border-b border-brand-50">
                <td className="p-3 font-medium text-cocoa-900">{s.name}</td>
                <td className="p-3">{s.email}</td>
                <td className="p-3">{s.department ?? "—"}</td>
                <td className="p-3"><StaffRowControls userId={s.id} role={s.role} isActive={s.isActive} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
