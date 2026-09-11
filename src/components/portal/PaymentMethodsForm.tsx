"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Config = {
  paystack: { enabled: boolean; publicKey: string; secretKeyMasked: string; secretKeyConfigured: boolean };
  hubtel: {
    enabled: boolean;
    merchantAccountNumber: string;
    clientId: string;
    clientSecretMasked: string;
    clientSecretConfigured: boolean;
  };
  manualMomo: { enabled: boolean; number: string; network: string; instructions: string };
};

export function PaymentMethodsForm({ initial }: { initial: Config }) {
  const router = useRouter();
  const [paystackEnabled, setPaystackEnabled] = useState(initial.paystack.enabled);
  const [hubtelEnabled, setHubtelEnabled] = useState(initial.hubtel.enabled);
  const [manualMomoEnabled, setManualMomoEnabled] = useState(initial.manualMomo.enabled);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/settings/payment", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paystackEnabled,
        paystackPublicKey: form.get("paystackPublicKey"),
        paystackSecretKey: form.get("paystackSecretKey"),
        hubtelEnabled,
        hubtelClientId: form.get("hubtelClientId"),
        hubtelClientSecret: form.get("hubtelClientSecret"),
        hubtelMerchantAccountNumber: form.get("hubtelMerchantAccountNumber"),
        manualMomoEnabled,
        manualMomoNumber: form.get("manualMomoNumber"),
        manualMomoNetwork: form.get("manualMomoNetwork"),
        manualMomoInstructions: form.get("manualMomoInstructions"),
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not save payment settings.");
      return;
    }
    setSaved(true);
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Paystack */}
      <div className="rounded-2xl border border-brand-100 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-cocoa-900">Paystack</h3>
            <p className="text-sm text-cocoa-900/60">Card and mobile money via a hosted checkout page.</p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={paystackEnabled}
              onChange={(e) => setPaystackEnabled(e.target.checked)}
              className="peer sr-only"
            />
            <div className="h-6 w-11 rounded-full bg-cocoa-50 transition peer-checked:bg-brand-500 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition after:content-[''] peer-checked:after:translate-x-5" />
          </label>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-cocoa-900">Public key</span>
            <input
              name="paystackPublicKey"
              defaultValue={initial.paystack.publicKey}
              placeholder="pk_live_..."
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-cocoa-900">Secret key</span>
            <input
              name="paystackSecretKey"
              type="password"
              placeholder={initial.paystack.secretKeyConfigured ? initial.paystack.secretKeyMasked : "sk_live_..."}
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm"
            />
            <span className="mt-1 block text-xs text-cocoa-900/50">
              {initial.paystack.secretKeyConfigured ? "Leave blank to keep the current key." : "Not configured yet."}
            </span>
          </label>
        </div>
      </div>

      {/* Hubtel */}
      <div className="rounded-2xl border border-brand-100 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-cocoa-900">Hubtel</h3>
            <p className="text-sm text-cocoa-900/60">Direct mobile money charge (MTN, Telecel, AirtelTigo) for POS, and hosted checkout online.</p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={hubtelEnabled}
              onChange={(e) => setHubtelEnabled(e.target.checked)}
              className="peer sr-only"
            />
            <div className="h-6 w-11 rounded-full bg-cocoa-50 transition peer-checked:bg-brand-500 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition after:content-[''] peer-checked:after:translate-x-5" />
          </label>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-cocoa-900">Merchant account number</span>
            <input
              name="hubtelMerchantAccountNumber"
              defaultValue={initial.hubtel.merchantAccountNumber}
              placeholder="e.g. 2020XXXXXX"
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-cocoa-900">Client ID</span>
            <input
              name="hubtelClientId"
              defaultValue={initial.hubtel.clientId}
              placeholder="API client ID"
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-cocoa-900">Client secret</span>
            <input
              name="hubtelClientSecret"
              type="password"
              placeholder={initial.hubtel.clientSecretConfigured ? initial.hubtel.clientSecretMasked : "API client secret"}
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm"
            />
            <span className="mt-1 block text-xs text-cocoa-900/50">
              {initial.hubtel.clientSecretConfigured ? "Leave blank to keep the current secret." : "Not configured yet."}
            </span>
          </label>
        </div>
      </div>

      {/* Direct / manual Mobile Money */}
      <div className="rounded-2xl border border-brand-100 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-cocoa-900">Direct Mobile Money</h3>
            <p className="text-sm text-cocoa-900/60">
              Customers send money straight to your own MoMo number (no gateway fees) and enter the
              transaction ID at checkout. Staff verify it against the MoMo statement and confirm the
              payment on the Payments screen.
            </p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={manualMomoEnabled}
              onChange={(e) => setManualMomoEnabled(e.target.checked)}
              className="peer sr-only"
            />
            <div className="h-6 w-11 rounded-full bg-cocoa-50 transition peer-checked:bg-brand-500 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition after:content-[''] peer-checked:after:translate-x-5" />
          </label>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-cocoa-900">MoMo number to display</span>
            <input
              name="manualMomoNumber"
              defaultValue={initial.manualMomo.number}
              placeholder="0244 000 000"
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-cocoa-900">Network</span>
            <input
              name="manualMomoNetwork"
              defaultValue={initial.manualMomo.network}
              placeholder="MTN Mobile Money"
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-cocoa-900">Instructions shown to customers</span>
            <textarea
              name="manualMomoInstructions"
              defaultValue={initial.manualMomo.instructions}
              rows={2}
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm"
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm text-cocoa-900/70">
        <span className="font-semibold text-cocoa-900">Cash, Card (manual) and Bank Transfer</span> are always
        available as payment methods for staff to record manually — no configuration needed. Enabling Paystack
        or Hubtel above adds them as real, gateway-processed options in the POS and online checkout.
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
          {saving ? "Saving..." : "Save Payment Settings"}
        </button>
        {saved && <span className="text-sm text-green-600">Saved ✓</span>}
      </div>
    </form>
  );
}
