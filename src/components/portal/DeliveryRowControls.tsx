"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED"];

export function DeliveryRowControls({
  deliveryId,
  status,
  riderId,
  riders,
}: {
  deliveryId: string;
  status: string;
  riderId: string | null;
  riders: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function update(data: Record<string, unknown>) {
    setSaving(true);
    await fetch(`/api/deliveries/${deliveryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <select
        defaultValue={riderId ?? ""}
        disabled={saving}
        onChange={(e) => update({ riderId: e.target.value })}
        className="rounded-lg border border-brand-200 px-2 py-1 text-xs"
      >
        <option value="">Unassigned</option>
        {riders.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
      </select>
      <select
        defaultValue={status}
        disabled={saving}
        onChange={(e) => update({ status: e.target.value })}
        className="rounded-lg border border-brand-200 px-2 py-1 text-xs"
      >
        {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
      </select>
    </div>
  );
}
