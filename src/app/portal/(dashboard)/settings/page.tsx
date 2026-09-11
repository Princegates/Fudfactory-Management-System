import { requireStaff } from "@/lib/session";
import { getBusinessProfile } from "@/lib/business";
import { BusinessSettingsForm } from "@/components/portal/BusinessSettingsForm";

export default async function SettingsPage() {
  await requireStaff(["SUPER_ADMIN"]);
  const profile = await getBusinessProfile();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-cocoa-900">Business Settings</h1>
      <p className="mt-1 text-sm text-cocoa-900/60">
        This information appears on the public website (contact page, footer) automatically.
      </p>
      <div className="mt-6 rounded-2xl border border-brand-100 bg-white p-5">
        <BusinessSettingsForm profile={profile} />
      </div>
    </div>
  );
}
