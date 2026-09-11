import { requireStaff } from "@/lib/session";
import { getSettings, SETTING_KEYS } from "@/lib/settings";
import { SettingsSimpleForm } from "@/components/portal/SettingsSimpleForm";

export default async function EmailSettingsPage() {
  await requireStaff(["SUPER_ADMIN"]);
  const s = await getSettings([
    SETTING_KEYS.smtpHost,
    SETTING_KEYS.smtpPort,
    SETTING_KEYS.smtpUser,
    SETTING_KEYS.smtpPassword,
    SETTING_KEYS.smtpFromAddress,
  ]);

  return (
    <div>
      <h2 className="text-lg font-bold text-cocoa-900">Email Setting</h2>
      <p className="mt-1 text-sm text-cocoa-900/60">SMTP configuration for sending order and receipt emails.</p>
      <div className="mt-6 max-w-2xl rounded-2xl border border-brand-100 bg-white p-5">
        <SettingsSimpleForm
          fields={[
            { key: SETTING_KEYS.smtpHost, label: "SMTP host", defaultValue: s[SETTING_KEYS.smtpHost] ?? "", placeholder: "smtp.gmail.com" },
            { key: SETTING_KEYS.smtpPort, label: "SMTP port", type: "number", defaultValue: s[SETTING_KEYS.smtpPort] ?? "587" },
            { key: SETTING_KEYS.smtpUser, label: "SMTP username", defaultValue: s[SETTING_KEYS.smtpUser] ?? "" },
            {
              key: SETTING_KEYS.smtpPassword,
              label: "SMTP password",
              type: "password",
              placeholder: s[SETTING_KEYS.smtpPassword] ? "Leave blank to keep the current password" : "Password or app key",
            },
            {
              key: SETTING_KEYS.smtpFromAddress,
              label: "From address",
              type: "email",
              defaultValue: s[SETTING_KEYS.smtpFromAddress] ?? "",
              placeholder: "orders@fudfactory.gh",
            },
          ]}
        />
      </div>
    </div>
  );
}
