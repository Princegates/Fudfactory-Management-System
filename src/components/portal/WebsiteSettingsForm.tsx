"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export function WebsiteSettingsForm({ heroImageUrl, businessHours }: { heroImageUrl: string | null; businessHours: string }) {
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
