import { requireStaff } from "@/lib/session";
import { getSettings, SETTING_KEYS } from "@/lib/settings";
import { SettingsSimpleForm } from "@/components/portal/SettingsSimpleForm";

export default async function NotificationSettingsPage() {
  await requireStaff(["SUPER_ADMIN"]);
  const s = await getSettings([
    SETTING_KEYS.notifSmsEnabled,
    SETTING_KEYS.notifEmailEnabled,
    SETTING_KEYS.notifWhatsappEnabled,
  ]);

  return (
    <div>
      <h2 className="text-lg font-bold text-cocoa-900">Notification Settings</h2>
      <p className="mt-1 text-sm text-cocoa-900/60">
        Choose which channels send automated order updates to customers (order received, confirmed,
        preparing, ready, out for delivery, completed).
      </p>
      <div className="mt-6 max-w-2xl rounded-2xl border border-brand-100 bg-white p-5">
        <SettingsSimpleForm
          fields={[
            {
              key: SETTING_KEYS.notifSmsEnabled,
              label: "SMS notifications",
              type: "toggle",
              defaultValue: s[SETTING_KEYS.notifSmsEnabled] ?? "false",
              hint: "Requires SMS Setting to be configured.",
            },
            {
              key: SETTING_KEYS.notifEmailEnabled,
              label: "Email notifications",
              type: "toggle",
              defaultValue: s[SETTING_KEYS.notifEmailEnabled] ?? "false",
              hint: "Requires Email Setting (SMTP) to be configured.",
            },
            {
              key: SETTING_KEYS.notifWhatsappEnabled,
              label: "WhatsApp notifications",
              type: "toggle",
              defaultValue: s[SETTING_KEYS.notifWhatsappEnabled] ?? "false",
              hint: "Requires WhatsApp Messaging to be configured.",
            },
          ]}
        />
      </div>
    </div>
  );
}
