"use client";

import { useState, FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";

export type QuickField = {
  name: string;
  label: string;
  type?: "text" | "number" | "email" | "date" | "datetime-local" | "textarea" | "select";
  required?: boolean;
  options?: { value: string; label: string }[];
  step?: string;
};

export function QuickCreateForm({
  action,
  fields,
  buttonLabel = "+ New",
  title,
}: {
  action: string;
  fields: QuickField[];
  buttonLabel?: string;
  title?: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {};
    for (const field of fields) {
      const value = form.get(field.name);
      if (value !== null && value !== "") {
        payload[field.name] = field.type === "number" ? Number(value) : value;
      }
    }

    const res = await fetch(action, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">
        {buttonLabel}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid gap-3 rounded-2xl border border-brand-100 bg-white p-4 sm:grid-cols-2">
      {title && <div className="sm:col-span-2 font-bold text-cocoa-900">{title}</div>}
      {fields.map((field) =>
        field.type === "textarea" ? (
          <textarea key={field.name} name={field.name} required={field.required} placeholder={field.label} rows={3} className="rounded-lg border border-brand-200 px-3 py-2 text-sm sm:col-span-2" />
        ) : field.type === "select" ? (
          <select key={field.name} name={field.name} required={field.required} defaultValue="" className="rounded-lg border border-brand-200 px-3 py-2 text-sm">
            <option value="" disabled>{field.label}</option>
            {field.options?.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        ) : (
          <input
            key={field.name}
            name={field.name}
            type={field.type ?? "text"}
            step={field.step}
            required={field.required}
            placeholder={field.label}
            className="rounded-lg border border-brand-200 px-3 py-2 text-sm"
          />
        ),
      )}
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" disabled={submitting} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
          {submitting ? "Saving..." : "Save"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-cocoa-900">
          Cancel
        </button>
      </div>
    </form>
  );
}
