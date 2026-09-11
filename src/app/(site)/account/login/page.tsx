"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/auth/customer/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Login failed.");
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
          Log <span className="text-gradient">In</span>
        </h1>
        <form onSubmit={handleSubmit} className="glass mt-6 flex flex-col gap-3 rounded-2xl p-6">
          <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="input-dark rounded-lg px-4 py-2.5 text-sm" />
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="input-dark rounded-lg px-4 py-2.5 text-sm" />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-glow rounded-full py-3 text-sm font-semibold disabled:opacity-60">
            {submitting ? "Logging in..." : "Log In"}
          </button>
        </form>
        <p className="mt-4 text-sm" style={{ color: "var(--text-mid)" }}>
          No account yet?{" "}
          <Link href="/account/register" className="font-semibold hover:underline" style={{ color: "var(--glow-cyan)" }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
