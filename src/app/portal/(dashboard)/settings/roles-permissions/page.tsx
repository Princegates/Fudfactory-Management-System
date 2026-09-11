import { requireStaff } from "@/lib/session";
import { PORTAL_NAV, ALL_ROLES } from "@/lib/permissions";

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  OWNER_MANAGER: "Owner/Manager",
  CASHIER: "Cashier",
  INVENTORY_OFFICER: "Inventory",
  PRODUCTION_OFFICER: "Production",
  DELIVERY_OFFICER: "Delivery",
};

export default async function RolesPermissionsPage() {
  await requireStaff(["SUPER_ADMIN"]);

  return (
    <div>
      <h2 className="text-lg font-bold text-cocoa-900">Roles &amp; Permissions</h2>
      <p className="mt-1 text-sm text-cocoa-900/60">
        Module access by staff role. This is a reference view — permissions are enforced in code for
        security and aren&apos;t user-editable here. To change a staff member&apos;s role, use
        Users.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-100 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-brand-100 text-left text-cocoa-900/50">
              <th className="p-3">Module</th>
              {ALL_ROLES.map((role) => (
                <th key={role} className="p-3 text-center">{ROLE_LABELS[role]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PORTAL_NAV.map((item) => (
              <tr key={item.href} className="border-b border-brand-50">
                <td className="p-3 font-medium text-cocoa-900">{item.label}</td>
                {ALL_ROLES.map((role) => (
                  <td key={role} className="p-3 text-center">
                    {item.roles.includes(role) ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-cocoa-900/20">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
