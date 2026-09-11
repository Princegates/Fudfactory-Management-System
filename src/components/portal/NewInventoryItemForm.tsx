"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export function NewInventoryItemForm({ suppliers }: { suppliers: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sku: form.get("sku"),
        name: form.get("name"),
        itemType: form.get("itemType"),
        unit: form.get("unit"),
        costPerUnit: Number(form.get("costPerUnit")) || 0,
        minStock: Number(form.get("minStock")) || 0,
        supplierId: form.get("supplierId") || undefined,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not create item.");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">
        + New Item
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid gap-3 rounded-2xl border border-brand-100 bg-white p-4 sm:grid-cols-3">
      <input name="sku" required placeholder="SKU" className="rounded-lg border border-brand-200 px-3 py-2 text-sm" />
      <input name="name" required placeholder="Name" className="rounded-lg border border-brand-200 px-3 py-2 text-sm" />
      <select name="itemType" className="rounded-lg border border-brand-200 px-3 py-2 text-sm">
        <option value="RAW_MATERIAL">Raw Material</option>
        <option value="FINISHED_PRODUCT">Finished Product</option>
      </select>
      <input name="unit" required placeholder="Unit (kg, g, pcs...)" className="rounded-lg border border-brand-200 px-3 py-2 text-sm" />
      <input name="costPerUnit" type="number" step="0.01" placeholder="Cost per unit" className="rounded-lg border border-brand-200 px-3 py-2 text-sm" />
      <input name="minStock" type="number" step="0.01" placeholder="Minimum stock level" className="rounded-lg border border-brand-200 px-3 py-2 text-sm" />
      <select name="supplierId" className="rounded-lg border border-brand-200 px-3 py-2 text-sm">
        <option value="">No supplier</option>
        {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      {error && <p className="text-sm text-red-600 sm:col-span-3">{error}</p>}
      <div className="flex gap-2 sm:col-span-3">
        <button type="submit" disabled={submitting} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
          {submitting ? "Saving..." : "Save Item"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-cocoa-900">
          Cancel
        </button>
      </div>
    </form>
  );
}
