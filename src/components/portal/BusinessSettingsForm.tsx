"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Profile = {
  businessName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  instagramHandle: string;
  facebookUrl: string | null;
  aboutText: string | null;
};

export function BusinessSettingsForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <input name="businessName" defaultValue={profile.businessName} placeholder="Business name" className="rounded-lg border border-brand-200 px-3 py-2 text-sm" />
      <input name="tagline" defaultValue={profile.tagline} placeholder="Tagline" className="rounded-lg border border-brand-200 px-3 py-2 text-sm" />
      <input name="phone" defaultValue={profile.phone} placeholder="Phone" className="rounded-lg border border-brand-200 px-3 py-2 text-sm" />
      <input name="whatsapp" defaultValue={profile.whatsapp} placeholder="WhatsApp number" className="rounded-lg border border-brand-200 px-3 py-2 text-sm" />
      <input name="email" defaultValue={profile.email} placeholder="Email" className="rounded-lg border border-brand-200 px-3 py-2 text-sm" />
      <input name="address" defaultValue={profile.address} placeholder="Address" className="rounded-lg border border-brand-200 px-3 py-2 text-sm" />
      <input name="instagramHandle" defaultValue={profile.instagramHandle} placeholder="Instagram handle (no @)" className="rounded-lg border border-brand-200 px-3 py-2 text-sm" />
      <input name="facebookUrl" defaultValue={profile.facebookUrl ?? ""} placeholder="Facebook URL (optional)" className="rounded-lg border border-brand-200 px-3 py-2 text-sm" />
      <textarea name="aboutText" defaultValue={profile.aboutText ?? ""} placeholder="About us text" rows={4} className="rounded-lg border border-brand-200 px-3 py-2 text-sm sm:col-span-2" />
      <div className="sm:col-span-2 flex items-center gap-3">
        <button type="submit" disabled={saving} className="rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
          {saving ? "Saving..." : "Save Settings"}
        </button>
        {saved && <span className="text-sm text-green-600">Saved ✓</span>}
      </div>
    </form>
  );
}
