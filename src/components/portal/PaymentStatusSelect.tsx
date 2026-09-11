"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["PENDING", "SUCCESSFUL", "FAILED", "REFUNDED", "PARTIALLY_PAID"];

export function PaymentStatusSelect({ paymentId, status }: { paymentId: string; status: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function update(next: string) {
    setSaving(true);
    await fetch(`/api/payments/${paymentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <select defaultValue={status} disabled={saving} onChange={(e) => update(e.target.value)} className="rounded-lg border border-brand-200 px-2 py-1 text-xs">
      {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
    </select>
  );
}
