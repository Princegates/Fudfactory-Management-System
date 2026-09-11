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
    <div className="relative">
      <div className="aurora-bg opacity-30" />
      <div className="relative mx-auto max-w-md px-4 py-24 sm:px-6">
        <h1 className="font-display text-3xl font-bold" style={{ color: "var(--text-hi)" }}>
          Create an <span className="text-gradient">Account</span>
        </h1>
        <form onSubmit={handleSubmit} className="glass mt-6 flex flex-col gap-3 rounded-2xl p-6">
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="input-dark rounded-lg px-4 py-2.5 text-sm" />
          <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="input-dark rounded-lg px-4 py-2.5 text-sm" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" className="input-dark rounded-lg px-4 py-2.5 text-sm" />
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Default address (optional)" className="input-dark rounded-lg px-4 py-2.5 text-sm" />
          <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6 characters)" className="input-dark rounded-lg px-4 py-2.5 text-sm" />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-glow rounded-md py-3 text-sm font-semibold disabled:opacity-60">
            {submitting ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <p className="mt-4 text-sm" style={{ color: "var(--text-mid)" }}>
          Already have an account?{" "}
          <Link href="/account/login" className="font-semibold hover:underline" style={{ color: "var(--glow-cyan)" }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
