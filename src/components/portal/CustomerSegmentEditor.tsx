"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SEGMENTS = ["NEW", "REGULAR", "VIP", "CORPORATE", "EVENT", "INACTIVE"];

export function CustomerSegmentEditor({ customerId, currentSegment }: { customerId: string; currentSegment: string }) {
  const router = useRouter();
  const [segment, setSegment] = useState(currentSegment);
  const [saving, setSaving] = useState(false);

  async function save(next: string) {
    setSegment(next);
    setSaving(true);
    await fetch(`/api/customers/${customerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ segment: next }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <select
      value={segment}
      onChange={(e) => save(e.target.value)}
      disabled={saving}
      className="rounded-lg border border-brand-200 px-3 py-1.5 text-sm"
    >
      {SEGMENTS.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}
