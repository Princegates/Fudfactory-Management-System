"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ROLES = ["SUPER_ADMIN", "OWNER_MANAGER", "CASHIER", "INVENTORY_OFFICER", "PRODUCTION_OFFICER", "DELIVERY_OFFICER"];

export function StaffRowControls({ userId, role, isActive }: { userId: string; role: string; isActive: boolean }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function update(data: Record<string, unknown>) {
    setSaving(true);
    await fetch(`/api/staff/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <select defaultValue={role} disabled={saving} onChange={(e) => update({ role: e.target.value })} className="rounded-lg border border-brand-200 px-2 py-1 text-xs">
        {ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
      </select>
      <button
        type="button"
        onClick={() => update({ isActive: !isActive })}
        disabled={saving}
        className={`rounded-full px-3 py-1 text-xs font-semibold ${isActive ? "bg-cocoa-50 text-cocoa-900" : "bg-red-100 text-red-700"}`}
      >
        {isActive ? "Active" : "Deactivated"}
      </button>
    </div>
  );
}
