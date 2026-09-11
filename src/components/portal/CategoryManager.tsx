"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DeleteButton } from "./DeleteButton";

export function CategoryManager({ categories }: { categories: { id: string; name: string; productCount: number }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  async function rename(id: string, name: string) {
    if (!name.trim()) return;
    setSaving(id);
    await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    setSaving(null);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-brand-200 px-4 py-2 text-sm font-semibold text-cocoa-900 hover:bg-brand-50"
      >
        Manage categories
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-brand-100 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-cocoa-900">Categories</h2>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-cocoa-900/50 hover:text-cocoa-900">
          Close
        </button>
      </div>
      <ul className="mt-3 divide-y divide-brand-50">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center gap-2 py-2">
            <input
              value={editing[c.id] ?? c.name}
              onChange={(e) => setEditing((prev) => ({ ...prev, [c.id]: e.target.value }))}
              onBlur={(e) => e.target.value !== c.name && rename(c.id, e.target.value)}
              disabled={saving === c.id}
              className="flex-1 rounded-lg border border-brand-200 px-2 py-1 text-sm"
            />
            <span className="text-xs text-cocoa-900/50">{c.productCount} product(s)</span>
            <DeleteButton
              action={`/api/categories/${c.id}`}
              confirmText={`Delete "${c.name}"? Only possible if it has no products.`}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
