"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteButton({
  action,
  confirmText = "Delete this? This can't be undone.",
  className = "",
  label = "Delete",
}: {
  action: string;
  confirmText?: string;
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    const res = await fetch(action, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      window.alert(data.error ?? "Couldn't delete this — it may still be in use elsewhere.");
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={busy}
      className={`rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60 ${className}`}
    >
      {busy ? "…" : label}
    </button>
  );
}
