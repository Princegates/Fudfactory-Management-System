import { requireStaff } from "@/lib/session";
import { getSettings, SETTING_KEYS } from "@/lib/settings";
import { SettingsSimpleForm } from "@/components/portal/SettingsSimpleForm";

export default async function CurrencySettingsPage() {
  await requireStaff(["SUPER_ADMIN"]);
  const s = await getSettings([SETTING_KEYS.currencyCode, SETTING_KEYS.currencySymbol, SETTING_KEYS.timezone]);

  return (
    <div>
      <h2 className="text-lg font-bold text-cocoa-900">Currency</h2>
      <p className="mt-1 text-sm text-cocoa-900/60">
        Display-only for now — amounts are formatted as Ghana cedis throughout the system. Stored here
        for when multi-currency support is added.
      </p>
      <div className="mt-6 max-w-2xl rounded-2xl border border-brand-100 bg-white p-5">
        <SettingsSimpleForm
          fields={[
            { key: SETTING_KEYS.currencyCode, label: "Currency code", defaultValue: s[SETTING_KEYS.currencyCode] ?? "GHS" },
            { key: SETTING_KEYS.currencySymbol, label: "Currency symbol", defaultValue: s[SETTING_KEYS.currencySymbol] ?? "GH₵" },
            { key: SETTING_KEYS.timezone, label: "Timezone", defaultValue: s[SETTING_KEYS.timezone] ?? "Africa/Accra" },
          ]}
        />
      </div>
    </div>
  );
}
