"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export type SettingsField = {
  key: string; // SETTING_KEYS value
  label: string;
  type?: "text" | "password" | "email" | "number" | "textarea" | "toggle" | "select";
  placeholder?: string;
  defaultValue?: string;
  hint?: string;
  options?: { value: string; label: string }[];
};

export function SettingsSimpleForm({ fields, submitLabel = "Save Settings" }: { fields: SettingsField[]; submitLabel?: string }) {
  const router = useRouter();
  const toggleFields = fields.filter((f) => f.type === "toggle");
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(toggleFields.map((f) => [f.key, f.defaultValue === "true"])),
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    const form = new FormData(e.currentTarget);
    const values: Record<string, string> = {};
    for (const field of fields) {
      if (field.type === "toggle") {
        values[field.key] = String(toggles[field.key] ?? false);
      } else {
        values[field.key] = String(form.get(field.key) ?? "");
      }
    }

    const res = await fetch("/api/settings/simple", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not save settings.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => {
        if (field.type === "toggle") {
          return (
            <div key={field.key} className="flex items-center justify-between rounded-xl border border-brand-100 p-4">
              <div>
                <p className="font-medium text-cocoa-900">{field.label}</p>
                {field.hint && <p className="text-xs text-cocoa-900/50">{field.hint}</p>}
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={toggles[field.key] ?? false}
                  onChange={(e) => setToggles((prev) => ({ ...prev, [field.key]: e.target.checked }))}
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-cocoa-50 transition peer-checked:bg-brand-500 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition after:content-[''] peer-checked:after:translate-x-5" />
              </label>
            </div>
          );
        }
        return (
          <label key={field.key} className="block text-sm">
            <span className="mb-1 block font-medium text-cocoa-900">{field.label}</span>
            {field.type === "textarea" ? (
              <textarea
                name={field.key}
                defaultValue={field.defaultValue}
                placeholder={field.placeholder}
                rows={3}
                className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm"
              />
            ) : field.type === "select" ? (
              <select name={field.key} defaultValue={field.defaultValue} className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm">
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <input
                name={field.key}
                type={field.type ?? "text"}
                defaultValue={field.type === "password" ? "" : field.defaultValue}
                placeholder={field.placeholder}
                className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm"
              />
            )}
            {field.hint && <span className="mt-1 block text-xs text-cocoa-900/50">{field.hint}</span>}
          </label>
        );
      })}

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving} className="rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
          {saving ? "Saving..." : submitLabel}
        </button>
        {saved && <span className="text-sm text-green-600">Saved ✓</span>}
      </div>
    </form>
  );
}
