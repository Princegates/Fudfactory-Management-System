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
      <input name="customerName" required placeholder="Full name" className="input" />
      <input name="phone" required placeholder="Phone number" className="input" />
      <input name="email" type="email" placeholder="Email (optional)" className="input" />
      <select name="eventType" required className="input" defaultValue="">
        <option value="" disabled>
          Select event type
        </option>
        {EVENT_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <input name="eventDate" type="date" className="input" />
      <input name="guestCount" type="number" min={1} placeholder="Guest count (optional)" className="input" />
      <textarea
        name="requirements"
        rows={4}
        placeholder="Design preferences, flavours, special instructions..."
        className="input sm:col-span-2"
      />
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60 sm:col-span-2 sm:w-fit"
      >
        {submitting ? "Submitting..." : "Request a Quotation"}
      </button>

      <style jsx>{`
        .input {
          border: 1px solid var(--brand-200, #f6c98c);
          border-radius: 0.75rem;
          padding: 0.625rem 1rem;
          font-size: 0.875rem;
          background: white;
        }
        .input:focus {
          outline: none;
          border-color: var(--brand-400, #e08a33);
        }
      `}</style>
    </form>
  );
}
