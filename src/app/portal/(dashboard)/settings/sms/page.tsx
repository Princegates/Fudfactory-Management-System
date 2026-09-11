import { requireStaff } from "@/lib/session";
import { getSettings, SETTING_KEYS } from "@/lib/settings";
import { SettingsSimpleForm } from "@/components/portal/SettingsSimpleForm";

export default async function SmsSettingsPage() {
  await requireStaff(["SUPER_ADMIN"]);
  const s = await getSettings([SETTING_KEYS.smsProvider, SETTING_KEYS.smsApiKey, SETTING_KEYS.smsSenderId]);

  return (
    <div>
      <h2 className="text-lg font-bold text-cocoa-900">SMS Setting</h2>
      <p className="mt-1 text-sm text-cocoa-900/60">
        Connect an SMS gateway (e.g. Hubtel SMS, Arkesel, Mnotify) to send order updates by text message.
      </p>
      <div className="mt-6 max-w-2xl rounded-2xl border border-brand-100 bg-white p-5">
        <SettingsSimpleForm
          fields={[
            {
              key: SETTING_KEYS.smsProvider,
              label: "Provider",
              type: "select",
              defaultValue: s[SETTING_KEYS.smsProvider] ?? "hubtel",
              options: [
                { value: "hubtel", label: "Hubtel SMS" },
                { value: "arkesel", label: "Arkesel" },
                { value: "mnotify", label: "mNotify" },
                { value: "other", label: "Other" },
              ],
            },
            { key: SETTING_KEYS.smsSenderId, label: "Sender ID", defaultValue: s[SETTING_KEYS.smsSenderId] ?? "", placeholder: "FudFactory" },
            {
              key: SETTING_KEYS.smsApiKey,
              label: "API key",
              type: "password",
              placeholder: s[SETTING_KEYS.smsApiKey] ? "Leave blank to keep the current key" : "API key",
            },
          ]}
        />
      </div>
    </div>
  );
}
