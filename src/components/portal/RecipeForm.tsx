"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Option = { id: string; name: string; unit?: string };

export function RecipeForm({ products, ingredients }: { products: Option[]; ingredients: Option[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([{ ingredientId: "", quantityPerYield: "" }]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateRow(idx: number, field: "ingredientId" | "quantityPerYield", value: string) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const validRows = rows.filter((r) => r.ingredientId && r.quantityPerYield);

    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: form.get("productId"),
        name: form.get("name"),
        yieldQuantity: Number(form.get("yieldQuantity")) || 1,
        laborCost: Number(form.get("laborCost")) || 0,
        packagingCost: Number(form.get("packagingCost")) || 0,
        overheadCost: Number(form.get("overheadCost")) || 0,
        items: validRows.map((r) => ({ ingredientId: r.ingredientId, quantityPerYield: Number(r.quantityPerYield) })),
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not save recipe.");
      return;
    }
    setOpen(false);
    setRows([{ ingredientId: "", quantityPerYield: "" }]);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">
        + New Recipe
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-2xl border border-brand-100 bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <select name="productId" required defaultValue="" className="rounded-lg border border-brand-200 px-3 py-2 text-sm">
          <option value="" disabled>Product</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input name="name" required placeholder="Recipe name" className="rounded-lg border border-brand-200 px-3 py-2 text-sm" />
        <input name="yieldQuantity" type="number" step="0.01" placeholder="Yield quantity (e.g. 20 pies)" className="rounded-lg border border-brand-200 px-3 py-2 text-sm" />
        <input name="laborCost" type="number" step="0.01" placeholder="Labor cost (per batch)" className="rounded-lg border border-brand-200 px-3 py-2 text-sm" />
        <input name="packagingCost" type="number" step="0.01" placeholder="Packaging cost (per batch)" className="rounded-lg border border-brand-200 px-3 py-2 text-sm" />
        <input name="overheadCost" type="number" step="0.01" placeholder="Overhead cost (per batch)" className="rounded-lg border border-brand-200 px-3 py-2 text-sm" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-cocoa-900">Ingredients (per batch yield)</h3>
      <div className="mt-2 space-y-2">
        {rows.map((row, idx) => (
          <div key={idx} className="flex gap-2">
            <select
              value={row.ingredientId}
              onChange={(e) => updateRow(idx, "ingredientId", e.target.value)}
              className="flex-1 rounded-lg border border-brand-200 px-3 py-2 text-sm"
            >
              <option value="">Select ingredient</option>
              {ingredients.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
            </select>
            <input
              value={row.quantityPerYield}
              onChange={(e) => updateRow(idx, "quantityPerYield", e.target.value)}
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
        onClick={() => setRows((prev) => [...prev, { ingredientId: "", quantityPerYield: "" }])}
        className="mt-2 text-sm font-semibold text-brand-600 hover:underline"
      >
        + Add ingredient
      </button>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <div className="mt-4 flex gap-2">
        <button type="submit" disabled={submitting} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
          {submitting ? "Saving..." : "Save Recipe"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-cocoa-900">
          Cancel
        </button>
      </div>
    </form>
  );
}
