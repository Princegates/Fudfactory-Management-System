import { requireStaff } from "@/lib/session";
import { getSettings, maskSecret, SETTING_KEYS } from "@/lib/settings";
import { PaymentMethodsForm } from "@/components/portal/PaymentMethodsForm";

export default async function PaymentMethodsSettingsPage() {
  await requireStaff(["SUPER_ADMIN"]);

  const s = await getSettings([
    SETTING_KEYS.paystackEnabled,
    SETTING_KEYS.paystackSecretKey,
    SETTING_KEYS.paystackPublicKey,
    SETTING_KEYS.hubtelEnabled,
    SETTING_KEYS.hubtelClientId,
    SETTING_KEYS.hubtelClientSecret,
    SETTING_KEYS.hubtelMerchantAccountNumber,
    SETTING_KEYS.manualMomoEnabled,
    SETTING_KEYS.manualMomoNumber,
    SETTING_KEYS.manualMomoNetwork,
    SETTING_KEYS.manualMomoInstructions,
  ]);

  const initial = {
    paystack: {
      enabled: s[SETTING_KEYS.paystackEnabled] === "true",
      publicKey: s[SETTING_KEYS.paystackPublicKey] ?? "",
      secretKeyMasked: maskSecret(s[SETTING_KEYS.paystackSecretKey]),
      secretKeyConfigured: Boolean(s[SETTING_KEYS.paystackSecretKey]),
    },
    hubtel: {
      enabled: s[SETTING_KEYS.hubtelEnabled] === "true",
      merchantAccountNumber: s[SETTING_KEYS.hubtelMerchantAccountNumber] ?? "",
      clientId: s[SETTING_KEYS.hubtelClientId] ?? "",
      clientSecretMasked: maskSecret(s[SETTING_KEYS.hubtelClientSecret]),
      clientSecretConfigured: Boolean(s[SETTING_KEYS.hubtelClientSecret]),
    },
    manualMomo: {
      enabled: s[SETTING_KEYS.manualMomoEnabled] === "true",
      number: s[SETTING_KEYS.manualMomoNumber] ?? "",
      network: s[SETTING_KEYS.manualMomoNetwork] ?? "MTN Mobile Money",
      instructions: s[SETTING_KEYS.manualMomoInstructions] ?? "",
    },
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-cocoa-900">Payment Methods</h2>
      <p className="mt-1 text-sm text-cocoa-900/60">
        Connect Paystack and Hubtel to accept real card and mobile money payments, or accept direct
        Mobile Money transfers to your own number, verified by transaction ID.
      </p>
      <div className="mt-6 max-w-2xl">
        <PaymentMethodsForm initial={initial} />
      </div>
    </div>
  );
}
