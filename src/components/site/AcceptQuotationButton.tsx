"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AcceptQuotationButton({ code }: { code: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/quotations/${code}/accept`, { method: "POST" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not accept this quotation.");
      setLoading(false);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <button type="button" onClick={accept} disabled={loading} className="btn-glow rounded-md px-6 py-3 text-sm font-semibold disabled:opacity-60">
        {loading ? "Accepting..." : "Accept Quotation"}
      </button>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
