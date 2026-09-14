"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteOrderButton({ orderId, orderNumber }: { orderId: string; orderNumber: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Permanently delete order ${orderNumber}? This can't be undone.`)) return;
    setBusy(true);
    const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      window.alert(data.error ?? "Couldn't delete this order.");
      return;
    }
    router.push("/portal/orders");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={busy}
      className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
    >
      {busy ? "…" : "Delete Order"}
    </button>
  );
}
