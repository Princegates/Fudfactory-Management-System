"use client";

import { useState } from "react";

export function RetryPaymentButton({
  orderNumber,
  phone,
  gateway,
}: {
  orderNumber: string;
  phone: string;
  gateway: "PAYSTACK" | "HUBTEL";
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function retry() {
    setLoading(true);
    setError(null);
    const endpoint = gateway === "PAYSTACK" ? "/api/payments/paystack/initialize" : "/api/payments/hubtel/checkout";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber, phone }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? "Could not start payment.");
      return;
    }
    window.location.href = data.authorizationUrl ?? data.checkoutUrl;
  }

  return (
    <div className="mt-4">
      <button type="button" onClick={retry} disabled={loading} className="btn-glow rounded-full px-6 py-2.5 text-sm font-semibold disabled:opacity-60">
        {loading ? "Starting payment..." : `Complete Payment with ${gateway === "PAYSTACK" ? "Paystack" : "Hubtel"}`}
      </button>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
