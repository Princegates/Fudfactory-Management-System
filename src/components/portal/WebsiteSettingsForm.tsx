"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export function WebsiteSettingsForm({
  businessName,
  tagline,
  phone,
  whatsapp,
  email,
  address,
  instagramHandle,
  facebookUrl,
  aboutText,
  logoUrl,
  heroImageUrl,
  businessHours,
}: {
  businessName: string;
  tagline: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  instagramHandle: string;
  facebookUrl: string | null;
  aboutText: string | null;
  logoUrl: string | null;
  heroImageUrl: string | null;
  businessHours: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const form = new FormData(e.currentTarget);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessName: form.get("businessName"),
        tagline: form.get("tagline"),
        phone: form.get("phone"),
        whatsapp: form.get("whatsapp"),
        email: form.get("email"),
        address: form.get("address"),
        instagramHandle: form.get("instagramHandle"),
        facebookUrl: form.get("facebookUrl"),
        aboutText: form.get("aboutText"),
        logoUrl: form.get("logoUrl"),
        heroImageUrl: form.get("heroImageUrl"),
        businessHours: form.get("businessHours"),
      }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-cocoa-900">Business name</span>
        <input name="businessName" defaultValue={businessName} className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm" />
        <span className="mt-1 block text-xs text-cocoa-900/50">Shown across the site, portal, receipts and emails.</span>
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-cocoa-900">Tagline</span>
        <input name="tagline" defaultValue={tagline} className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm" />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-cocoa-900">Logo image URL</span>
        <input name="logoUrl" defaultValue={logoUrl ?? ""} placeholder="https://..." className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm" />
        <span className="mt-1 block text-xs text-cocoa-900/50">Leave blank to show your business name as a styled text wordmark instead.</span>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-cocoa-900">Phone</span>
          <input name="phone" defaultValue={phone ?? ""} className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-cocoa-900">WhatsApp</span>
          <input name="whatsapp" defaultValue={whatsapp ?? ""} className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-cocoa-900">Email</span>
          <input name="email" type="email" defaultValue={email ?? ""} className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-cocoa-900">Address</span>
          <input name="address" defaultValue={address ?? ""} className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-cocoa-900">Instagram handle</span>
          <input name="instagramHandle" defaultValue={instagramHandle} className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-cocoa-900">Facebook URL</span>
          <input name="facebookUrl" defaultValue={facebookUrl ?? ""} className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm" />
        </label>
      </div>
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-cocoa-900">About text</span>
        <textarea name="aboutText" defaultValue={aboutText ?? ""} rows={3} className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm" />
        <span className="mt-1 block text-xs text-cocoa-900/50">Shown on the homepage and About page. Leave blank to use a generic default.</span>
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-cocoa-900">Homepage hero image URL</span>
        <input name="heroImageUrl" defaultValue={heroImageUrl ?? ""} placeholder="https://..." className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm" />
        <span className="mt-1 block text-xs text-cocoa-900/50">Leave blank to keep the generative gradient hero background.</span>
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-cocoa-900">Business hours</span>
        <textarea name="businessHours" defaultValue={businessHours} rows={3} className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm" />
        <span className="mt-1 block text-xs text-cocoa-900/50">One line per row — shown on the Contact page.</span>
      </label>
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving} className="rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
          {saving ? "Saving..." : "Save Website Settings"}
        </button>
        {saved && <span className="text-sm text-green-600">Saved ✓</span>}
      </div>
    </form>
  );
}
