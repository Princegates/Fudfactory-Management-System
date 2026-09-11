"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = [
  "NEW", "CONFIRMED", "PROCESSING", "PREPARING", "READY", "OUT_FOR_DELIVERY",
  "DELIVERED", "COMPLETED", "CANCELLED", "REFUNDED", "REJECTED", "PARTIALLY_FULFILLED",
];

export function OrderStatusUpdater({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not update status.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-brand-200 px-3 py-2 text-sm">
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
        ))}
      </select>
      <button
        type="button"
        onClick={save}
        disabled={saving || status === currentStatus}
        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Update Status"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
