"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DeleteButton } from "./DeleteButton";

export function SupplierRowControls({
  supplierId,
  phone,
  email,
  address,
  itemsSupplied,
}: {
  supplierId: string;
  phone: string;
  email: string;
  address: string;
  itemsSupplied: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState({ phone, email, address, itemsSupplied });
  const [saving, setSaving] = useState(false);

  async function save(field: string, value: string) {
    setSaving(true);
    await fetch(`/api/suppliers/${supplierId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        value={values.phone}
        placeholder="Phone"
        disabled={saving}
        onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
        onBlur={(e) => e.target.value !== phone && save("phone", e.target.value)}
        className="w-32 rounded-lg border border-brand-200 px-2 py-1 text-xs"
      />
      <input
        value={values.email}
        placeholder="Email"
        disabled={saving}
        onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
        onBlur={(e) => e.target.value !== email && save("email", e.target.value)}
        className="w-36 rounded-lg border border-brand-200 px-2 py-1 text-xs"
      />
      <input
        value={values.address}
        placeholder="Address"
        disabled={saving}
        onChange={(e) => setValues((v) => ({ ...v, address: e.target.value }))}
        onBlur={(e) => e.target.value !== address && save("address", e.target.value)}
        className="w-36 rounded-lg border border-brand-200 px-2 py-1 text-xs"
      />
      <input
        value={values.itemsSupplied}
        placeholder="Items supplied"
        disabled={saving}
        onChange={(e) => setValues((v) => ({ ...v, itemsSupplied: e.target.value }))}
        onBlur={(e) => e.target.value !== itemsSupplied && save("itemsSupplied", e.target.value)}
        className="w-40 rounded-lg border border-brand-200 px-2 py-1 text-xs"
      />
      <DeleteButton action={`/api/suppliers/${supplierId}`} confirmText="Delete this supplier?" />
    </div>
  );
}
