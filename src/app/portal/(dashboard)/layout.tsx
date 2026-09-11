import { requireStaff } from "@/lib/session";
import { navFor } from "@/lib/permissions";
import { PortalShell } from "@/components/portal/PortalShell";

export default async function PortalDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff();
  const items = navFor(session.role);

  return (
    <PortalShell items={items} staffName={session.name} staffRole={session.role}>
      {children}
    </PortalShell>
  );
}
