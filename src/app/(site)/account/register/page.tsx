"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/auth/customer/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, email: email || undefined, address: address || undefined, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Registration failed.");
      setSubmitting(false);
      return;
    }
    router.push("/account");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-extrabold text-cocoa-900">Create an Account</h1>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="rounded-lg border border-brand-200 px-4 py-2 text-sm" />
        <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="rounded-lg border border-brand-200 px-4 py-2 text-sm" />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" className="rounded-lg border border-brand-200 px-4 py-2 text-sm" />
        <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Default address (optional)" className="rounded-lg border border-brand-200 px-4 py-2 text-sm" />
        <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6 characters)" className="rounded-lg border border-brand-200 px-4 py-2 text-sm" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={submitting} className="rounded-full bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
          {submitting ? "Creating account..." : "Create Account"}
        </button>
      </form>
      <p className="mt-4 text-sm text-cocoa-900/70">
        Already have an account? <Link href="/account/login" className="text-brand-600 hover:underline">Log in</Link>
      </p>
    </div>
  );
}
