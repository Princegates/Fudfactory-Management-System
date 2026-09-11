"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DeleteButton } from "./DeleteButton";

export function ExpenseRowControls({
  expenseId,
  amount,
  description,
}: {
  expenseId: string;
  amount: number;
  description: string;
}) {
  const router = useRouter();
  const [amountValue, setAmountValue] = useState(amount);
  const [descValue, setDescValue] = useState(description);
  const [saving, setSaving] = useState(false);

  async function save(data: Record<string, unknown>) {
    setSaving(true);
    await fetch(`/api/expenses/${expenseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <input
        value={descValue}
        placeholder="Description"
        disabled={saving}
        onChange={(e) => setDescValue(e.target.value)}
        onBlur={(e) => e.target.value !== description && save({ description: e.target.value })}
        className="w-40 rounded-lg border border-brand-200 px-2 py-1 text-xs"
      />
      <input
        type="number"
        step="0.01"
        value={amountValue}
        disabled={saving}
        onChange={(e) => setAmountValue(Number(e.target.value))}
        onBlur={() => amountValue !== amount && save({ amount: amountValue })}
        className="w-24 rounded-lg border border-brand-200 px-2 py-1 text-xs"
      />
      <DeleteButton action={`/api/expenses/${expenseId}`} confirmText="Delete this expense record?" />
    </div>
  );
}
