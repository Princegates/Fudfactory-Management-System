"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ProductRowControls({
  productId,
  price,
  isAvailable,
  isFeatured,
}: {
  productId: string;
  price: number;
  isAvailable: boolean;
  isFeatured: boolean;
}) {
  const router = useRouter();
  const [priceValue, setPriceValue] = useState(price);
  const [saving, setSaving] = useState(false);

  async function update(data: Record<string, unknown>) {
    setSaving(true);
    await fetch(`/api/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="number"
        step="0.01"
        value={priceValue}
        onChange={(e) => setPriceValue(Number(e.target.value))}
        onBlur={() => priceValue !== price && update({ price: priceValue })}
        className="w-24 rounded-lg border border-brand-200 px-2 py-1 text-xs"
      />
      <button
        type="button"
        onClick={() => update({ isAvailable: !isAvailable })}
        disabled={saving}
        className={`rounded-full px-3 py-1 text-xs font-semibold ${isAvailable ? "bg-green-100 text-green-700" : "bg-cocoa-50 text-cocoa-900/60"}`}
      >
        {isAvailable ? "Available" : "Unavailable"}
      </button>
      <button
        type="button"
        onClick={() => update({ isFeatured: !isFeatured })}
        disabled={saving}
        className={`rounded-full px-3 py-1 text-xs font-semibold ${isFeatured ? "bg-brand-500 text-white" : "bg-brand-50 text-brand-700"}`}
      >
        {isFeatured ? "Featured" : "Feature"}
      </button>
    </div>
  );
}
