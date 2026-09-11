import { requireStaff } from "@/lib/session";
import { getSettings, SETTING_KEYS } from "@/lib/settings";
import { SettingsSimpleForm } from "@/components/portal/SettingsSimpleForm";

export default async function ReceiptSettingsPage() {
  await requireStaff(["SUPER_ADMIN"]);
  const s = await getSettings([SETTING_KEYS.receiptHeader, SETTING_KEYS.receiptFooter, SETTING_KEYS.thermalPaperWidth]);

  return (
    <div>
      <h2 className="text-lg font-bold text-cocoa-900">Print / Receipt Setting</h2>
      <p className="mt-1 text-sm text-cocoa-900/60">Header and footer text printed on POS receipts, and thermal printer paper width.</p>
      <div className="mt-6 max-w-2xl rounded-2xl border border-brand-100 bg-white p-5">
        <SettingsSimpleForm
          fields={[
            {
              key: SETTING_KEYS.receiptHeader,
              label: "Receipt header",
              type: "textarea",
              defaultValue: s[SETTING_KEYS.receiptHeader] ?? "FudFactory\nYour Favorite Chef",
            },
            {
              key: SETTING_KEYS.receiptFooter,
              label: "Receipt footer",
              type: "textarea",
              defaultValue: s[SETTING_KEYS.receiptFooter] ?? "Thank you for your order!\nfudfactory.gh",
            },
            {
              key: SETTING_KEYS.thermalPaperWidth,
              label: "Thermal printer paper width",
              type: "select",
              defaultValue: s[SETTING_KEYS.thermalPaperWidth] ?? "80",
              options: [
                { value: "58", label: "58mm" },
                { value: "80", label: "80mm" },
              ],
            },
          ]}
        />
      </div>
    </div>
  );
}
