"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/format";

type Item = { description: string; quantity: number; unitPrice: number };

export function QuotationEditor({
  code,
  initialItems,
  initialDeliveryFee,
  status,
}: {
  code: string;
  initialItems: Item[];
  initialDeliveryFee: number;
  status: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>(initialItems.length > 0 ? initialItems : [{ description: "", quantity: 1, unitPrice: 0 }]);
  const [deliveryFee, setDeliveryFee] = useState(initialDeliveryFee);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0) + deliveryFee;

  function updateItem(idx: number, field: keyof Item, value: string) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, [field]: field === "description" ? value : Number(value) } : item,
      ),
    );
  }

  async function save(sendToCustomer: boolean) {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/quotations/${code}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.filter((i) => i.description),
        deliveryFee,
        status: sendToCustomer ? "SENT" : undefined,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not save quotation.");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-wrap gap-2">
            <input
              value={item.description}
              onChange={(e) => updateItem(idx, "description", e.target.value)}
              placeholder="Item description"
              className="flex-1 rounded-lg border border-brand-200 px-3 py-2 text-sm"
            />
            <input
              value={item.quantity}
              onChange={(e) => updateItem(idx, "quantity", e.target.value)}
              type="number"
              placeholder="Qty"
              className="w-20 rounded-lg border border-brand-200 px-3 py-2 text-sm"
            />
            <input
              value={item.unitPrice}
              onChange={(e) => updateItem(idx, "unitPrice", e.target.value)}
              type="number"
              step="0.01"
              placeholder="Unit price"
              className="w-28 rounded-lg border border-brand-200 px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setItems((prev) => [...prev, { description: "", quantity: 1, unitPrice: 0 }])}
        className="mt-2 text-sm font-semibold text-brand-600 hover:underline"
      >
        + Add line item
      </button>

      <div className="mt-4 flex items-center gap-2">
        <label className="text-sm text-cocoa-900">Delivery fee</label>
        <input
          value={deliveryFee}
          onChange={(e) => setDeliveryFee(Number(e.target.value))}
          type="number"
          step="0.01"
          className="w-28 rounded-lg border border-brand-200 px-3 py-2 text-sm"
        />
      </div>

      <p className="mt-3 text-lg font-bold text-brand-700">Total: {formatCurrency(total)}</p>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => save(false)}
          disabled={saving}
          className="rounded-lg border border-brand-300 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-60"
        >
          Save Draft
        </button>
        <button
          type="button"
          onClick={() => save(true)}
          disabled={saving || status === "ACCEPTED"}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
        >
          Save &amp; Send to Customer
        </button>
      </div>
    </div>
  );
}
