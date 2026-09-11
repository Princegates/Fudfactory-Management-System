"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DeleteButton } from "./DeleteButton";

export function PromotionRowControls({ promotionId, isActive }: { promotionId: string; isActive: boolean }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function update(data: Record<string, unknown>) {
    setSaving(true);
    await fetch(`/api/promotions/${promotionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="mt-3 flex items-center gap-2">
      <button
        type="button"
        onClick={() => update({ isActive: !isActive })}
        disabled={saving}
        className={`rounded-full px-3 py-1 text-xs font-semibold ${isActive ? "bg-cocoa-50 text-cocoa-900" : "bg-green-100 text-green-700"}`}
      >
        {isActive ? "Deactivate" : "Activate"}
      </button>
      <DeleteButton action={`/api/promotions/${promotionId}`} confirmText="Delete this promotion?" />
    </div>
  );
}
