import { requireStaff } from "@/lib/session";
import { navFor } from "@/lib/permissions";
import { PortalShell } from "@/components/portal/PortalShell";
import { getBusinessProfile } from "@/lib/business";

export default async function PortalDashboardLayout({ children }: { children: React.ReactNode }) {
  const [session, business] = await Promise.all([requireStaff(), getBusinessProfile()]);
  const items = navFor(session.role);

  return (
    <PortalShell
      items={items}
      staffName={session.name}
      staffRole={session.role}
      businessName={business.businessName}
      logoUrl={business.logoUrl}
    >
      {children}
    </PortalShell>
  );
}
