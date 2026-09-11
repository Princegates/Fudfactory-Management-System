"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReviewApprovalToggle({ reviewId, isApproved }: { reviewId: string; isApproved: boolean }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function toggle() {
    setSaving(true);
    await fetch(`/api/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: !isApproved }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={saving}
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        isApproved ? "bg-cocoa-50 text-cocoa-900" : "bg-brand-500 text-white"
      }`}
    >
      {isApproved ? "Unpublish" : "Approve"}
    </button>
  );
}
