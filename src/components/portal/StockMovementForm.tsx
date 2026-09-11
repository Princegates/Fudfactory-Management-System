"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export function StockMovementForm({ itemId }: { itemId: string }) {
  const router = useRouter();
  const [type, setType] = useState("RECEIPT");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const label =
    type === "COUNT" ? "New counted stock level" : type === "ADJUSTMENT" ? "Adjustment (+/-)" : "Quantity";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch(`/api/inventory/${itemId}/movement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        quantity: Number(form.get("quantity")),
        note: form.get("note") || undefined,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not record movement.");
      return;
    }
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-4">
      <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border border-brand-200 px-3 py-2 text-sm">
        <option value="RECEIPT">Stock Receipt</option>
        <option value="ISSUE">Stock Issue</option>
        <option value="TRANSFER">Stock Transfer (out)</option>
        <option value="ADJUSTMENT">Adjustment</option>
        <option value="COUNT">Stock Count</option>
      </select>
      <input name="quantity" type="number" step="0.01" required placeholder={label} className="rounded-lg border border-brand-200 px-3 py-2 text-sm" />
      <input name="note" placeholder="Note (optional)" className="rounded-lg border border-brand-200 px-3 py-2 text-sm sm:col-span-1" />
      <button type="submit" disabled={submitting} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
        {submitting ? "Saving..." : "Record"}
      </button>
      {error && <p className="text-sm text-red-600 sm:col-span-4">{error}</p>}
    </form>
  );
}
