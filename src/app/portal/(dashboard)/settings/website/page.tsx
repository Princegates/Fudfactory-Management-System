import { requireStaff } from "@/lib/session";
import { getBusinessProfile } from "@/lib/business";
import { WebsiteSettingsForm } from "@/components/portal/WebsiteSettingsForm";

export default async function WebsiteSettingsPage() {
  await requireStaff(["SUPER_ADMIN"]);
  const profile = await getBusinessProfile();

  return (
    <div>
      <h2 className="text-lg font-bold text-cocoa-900">Website (Front CMS)</h2>
      <p className="mt-1 text-sm text-cocoa-900/60">
        Your business identity and homepage content. Products, prices and images are managed separately under Menu / Products.
      </p>
      <div className="mt-6 max-w-2xl rounded-2xl border border-brand-100 bg-white p-5">
        <WebsiteSettingsForm
          businessName={profile.businessName}
          tagline={profile.tagline}
          phone={profile.phone}
          whatsapp={profile.whatsapp}
          email={profile.email}
          address={profile.address}
          instagramHandle={profile.instagramHandle}
          facebookUrl={profile.facebookUrl}
          aboutText={profile.aboutText}
          logoUrl={profile.logoUrl}
          heroImageUrl={profile.heroImageUrl}
          businessHours={profile.businessHours}
        />
      </div>
    </div>
  );
}
