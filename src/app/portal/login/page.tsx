import { getBusinessProfile } from "@/lib/business";
import { StaffLoginForm } from "@/components/portal/StaffLoginForm";

export default async function StaffLoginPage() {
  const business = await getBusinessProfile();
  return <StaffLoginForm businessName={business.businessName} logoUrl={business.logoUrl} />;
}
