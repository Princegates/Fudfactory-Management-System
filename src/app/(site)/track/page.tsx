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
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-extrabold text-cocoa-900">Track Your Order</h1>
      <p className="mt-2 text-cocoa-900/70">Enter your order number and the phone number used to place it.</p>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
        <input
          required
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="Order number (e.g. ORD-2026-000145)"
          className="rounded-lg border border-brand-200 px-4 py-2 text-sm"
        />
        <input
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number"
          className="rounded-lg border border-brand-200 px-4 py-2 text-sm"
        />
        <button type="submit" className="rounded-full bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600">
          Track Order
        </button>
      </form>
    </div>
  );
}
