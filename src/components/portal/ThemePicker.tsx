"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SITE_THEMES } from "@/lib/themes";

export function ThemePicker({ current }: { current: string }) {
  const router = useRouter();
  const [active, setActive] = useState(current);
  const [saving, setSaving] = useState<string | null>(null);

  async function select(slug: string) {
    setSaving(slug);
    const res = await fetch("/api/settings/theme", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: slug }),
    });
    setSaving(null);
    if (res.ok) {
      setActive(slug);
      router.refresh();
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SITE_THEMES.map((theme) => {
        const isActive = theme.slug === active;
        return (
          <button
            key={theme.slug}
            type="button"
            onClick={() => select(theme.slug)}
            disabled={saving !== null}
            className={`rounded-2xl border-2 p-4 text-left transition ${
              isActive ? "border-brand-500 ring-2 ring-brand-200" : "border-brand-100 hover:border-brand-300"
            }`}
          >
            <div
              className="flex h-20 items-center justify-center gap-2 rounded-xl"
              style={{ background: theme.swatch.ink }}
            >
              <span className="h-5 w-5 rounded-full" style={{ background: theme.swatch.amber, boxShadow: `0 0 12px 2px ${theme.swatch.amber}` }} />
              <span className="h-5 w-5 rounded-full" style={{ background: theme.swatch.amberStrong, boxShadow: `0 0 12px 2px ${theme.swatch.amberStrong}` }} />
              <span className="h-5 w-5 rounded-full" style={{ background: theme.swatch.cyan, boxShadow: `0 0 12px 2px ${theme.swatch.cyan}` }} />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="font-bold text-cocoa-900">{theme.name}</p>
              {isActive && <span className="rounded-full bg-brand-500 px-2 py-0.5 text-xs font-semibold text-white">Active</span>}
              {saving === theme.slug && <span className="text-xs text-cocoa-900/50">Saving...</span>}
            </div>
            <p className="mt-1 text-xs text-cocoa-900/60">{theme.description}</p>
          </button>
        );
      })}
    </div>
  );
}
