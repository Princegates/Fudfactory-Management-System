"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Recipe = { id: string; name: string; productId: string; productName: string };

export function ProductionForm({ recipes }: { recipes: Recipe[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([{ recipeId: "", quantityPlanned: "" }]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateRow(idx: number, field: "recipeId" | "quantityPlanned", value: string) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const validRows = rows.filter((r) => r.recipeId && r.quantityPlanned);
    const items = validRows.map((r) => {
      const recipe = recipes.find((rec) => rec.id === r.recipeId)!;
      return { productId: recipe.productId, recipeId: recipe.id, quantityPlanned: Number(r.quantityPlanned) };
    });

    const res = await fetch("/api/production", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plannedDate: form.get("plannedDate") || undefined, notes: form.get("notes"), items }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not create production order.");
      return;
    }
    setOpen(false);
    setRows([{ recipeId: "", quantityPlanned: "" }]);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">
        + New Production Order
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-2xl border border-brand-100 bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="plannedDate" type="date" className="rounded-lg border border-brand-200 px-3 py-2 text-sm" />
        <input name="notes" placeholder="Notes (optional)" className="rounded-lg border border-brand-200 px-3 py-2 text-sm" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-cocoa-900">Products to produce</h3>
      <div className="mt-2 space-y-2">
        {rows.map((row, idx) => (
          <div key={idx} className="flex gap-2">
            <select
              value={row.recipeId}
              onChange={(e) => updateRow(idx, "recipeId", e.target.value)}
              className="flex-1 rounded-lg border border-brand-200 px-3 py-2 text-sm"
            >
              <option value="">Select recipe</option>
              {recipes.map((r) => (
                <option key={r.id} value={r.id}>{r.productName} — {r.name}</option>
              ))}
            </select>
            <input
              value={row.quantityPlanned}
              onChange={(e) => updateRow(idx, "quantityPlanned", e.target.value)}
              type="number"
              step="0.01"
              placeholder="Qty"
              className="w-28 rounded-lg border border-brand-200 px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setRows((prev) => [...prev, { recipeId: "", quantityPlanned: "" }])}
        className="mt-2 text-sm font-semibold text-brand-600 hover:underline"
      >
        + Add product
      </button>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <div className="mt-4 flex gap-2">
        <button type="submit" disabled={submitting} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
          {submitting ? "Saving..." : "Create Production Order"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-cocoa-900">
          Cancel
        </button>
      </div>
    </form>
  );
}
