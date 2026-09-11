"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

const EVENT_TYPES = [
  "Birthday Cake",
  "Wedding Cake",
  "Corporate Order",
  "Graduation Cake",
  "Party Package",
  "Bulk Order",
  "Full Event Planning",
  "Other",
];

export function QuotationRequestForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      customerName: form.get("customerName"),
      phone: form.get("phone"),
      email: form.get("email") || undefined,
      eventType: form.get("eventType"),
      eventDate: form.get("eventDate") || undefined,
      guestCount: form.get("guestCount") ? Number(form.get("guestCount")) : undefined,
      requirements: form.get("requirements") || undefined,
    };

    const res = await fetch("/api/quotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    const data = await res.json();
    router.push(`/quotation/${data.code}?submitted=1`);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <input name="customerName" required placeholder="Full name" className="input-dark rounded-xl px-4 py-2.5 text-sm" />
      <input name="phone" required placeholder="Phone number" className="input-dark rounded-xl px-4 py-2.5 text-sm" />
      <input name="email" type="email" placeholder="Email (optional)" className="input-dark rounded-xl px-4 py-2.5 text-sm" />
      <select name="eventType" required className="input-dark rounded-xl px-4 py-2.5 text-sm" defaultValue="">
        <option value="" disabled className="bg-ink-900">
          Select event type
        </option>
        {EVENT_TYPES.map((t) => (
          <option key={t} value={t} className="bg-ink-900">
            {t}
          </option>
        ))}
      </select>
      <input name="eventDate" type="date" className="input-dark rounded-xl px-4 py-2.5 text-sm" />
      <input name="guestCount" type="number" min={1} placeholder="Guest count (optional)" className="input-dark rounded-xl px-4 py-2.5 text-sm" />
      <textarea
        name="requirements"
        rows={4}
        placeholder="Design preferences, flavours, special instructions..."
        className="input-dark rounded-xl px-4 py-2.5 text-sm sm:col-span-2"
      />
      {error && <p className="text-sm text-red-400 sm:col-span-2">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="btn-glow rounded-md px-6 py-3 text-sm font-semibold disabled:opacity-60 sm:col-span-2 sm:w-fit"
      >
        {submitting ? "Submitting..." : "Request a Quotation"}
      </button>
    </form>
  );
}
