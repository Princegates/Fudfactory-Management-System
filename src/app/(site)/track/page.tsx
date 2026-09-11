"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    router.push(`/order/${encodeURIComponent(orderNumber.trim())}?phone=${encodeURIComponent(phone.trim())}`);
  }

  return (
    <div className="relative">
      <div className="aurora-bg opacity-30" />
      <div className="relative mx-auto max-w-md px-4 py-24 sm:px-6">
        <h1 className="font-display text-3xl font-bold" style={{ color: "var(--text-hi)" }}>
          Track Your <span className="text-gradient">Order</span>
        </h1>
        <p className="mt-2" style={{ color: "var(--text-mid)" }}>Enter your order number and the phone number used to place it.</p>
        <form onSubmit={handleSubmit} className="glass mt-6 flex flex-col gap-3 rounded-2xl p-6">
          <input
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Order number (e.g. ORD-2026-000145)"
            className="input-dark rounded-lg px-4 py-2.5 text-sm"
          />
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            className="input-dark rounded-lg px-4 py-2.5 text-sm"
          />
          <button type="submit" className="btn-glow rounded-full py-3 text-sm font-semibold">
            Track Order
          </button>
        </form>
      </div>
    </div>
  );
}
