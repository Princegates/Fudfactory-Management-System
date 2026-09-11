import { requireStaff } from "@/lib/session";
import { getSettings, SETTING_KEYS } from "@/lib/settings";
import { SettingsSimpleForm } from "@/components/portal/SettingsSimpleForm";

export default async function WhatsAppSettingsPage() {
  await requireStaff(["SUPER_ADMIN"]);
  const s = await getSettings([SETTING_KEYS.whatsappPhoneNumber, SETTING_KEYS.whatsappApiToken]);

  return (
    <div>
      <h2 className="text-lg font-bold text-cocoa-900">WhatsApp Messaging</h2>
      <p className="mt-1 text-sm text-cocoa-900/60">
        The business number customers reach on the Contact page, and credentials for the WhatsApp
        Business API once you&apos;re ready to send automated order updates through it.
      </p>
      <div className="mt-6 max-w-2xl rounded-2xl border border-brand-100 bg-white p-5">
        <SettingsSimpleForm
          fields={[
            {
              key: SETTING_KEYS.whatsappPhoneNumber,
              label: "WhatsApp number",
              defaultValue: s[SETTING_KEYS.whatsappPhoneNumber] ?? "",
              placeholder: "+233 20 000 0000",
            },
            {
              key: SETTING_KEYS.whatsappApiToken,
              label: "WhatsApp Business API access token",
              type: "password",
              placeholder: s[SETTING_KEYS.whatsappApiToken] ? "Leave blank to keep the current token" : "Optional — for automated messaging",
              hint: "Not required for the Contact page's click-to-chat link, which works without any setup.",
            },
          ]}
        />
      </div>
    </div>
  );
}
