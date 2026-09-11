"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DeleteButton } from "./DeleteButton";

export function InventoryItemRowControls({
  itemId,
  minStock,
  costPerUnit,
}: {
  itemId: string;
  minStock: number;
  costPerUnit: number;
}) {
  const router = useRouter();
  const [minStockValue, setMinStockValue] = useState(minStock);
  const [costValue, setCostValue] = useState(costPerUnit);
  const [saving, setSaving] = useState(false);

  async function save(data: Record<string, unknown>) {
    setSaving(true);
    await fetch(`/api/inventory/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <label className="flex items-center gap-1 text-xs text-cocoa-900/50">
        Min
        <input
          type="number"
          step="0.01"
          value={minStockValue}
          disabled={saving}
          onChange={(e) => setMinStockValue(Number(e.target.value))}
          onBlur={() => minStockValue !== minStock && save({ minStock: minStockValue })}
          className="w-20 rounded-lg border border-brand-200 px-2 py-1 text-xs"
        />
      </label>
      <label className="flex items-center gap-1 text-xs text-cocoa-900/50">
        Cost/unit
        <input
          type="number"
          step="0.001"
          value={costValue}
          disabled={saving}
          onChange={(e) => setCostValue(Number(e.target.value))}
          onBlur={() => costValue !== costPerUnit && save({ costPerUnit: costValue })}
          className="w-20 rounded-lg border border-brand-200 px-2 py-1 text-xs"
        />
      </label>
      <DeleteButton action={`/api/inventory/${itemId}`} confirmText="Delete this inventory item?" />
    </div>
  );
}
