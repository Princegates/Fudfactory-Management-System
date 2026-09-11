"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/auth/staff/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Login failed.");
      setSubmitting(false);
      return;
    }
    router.push("/portal");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-900 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <div className="flex items-center gap-2 text-cocoa-900">
          <Logo className="h-8" />
          <span className="text-lg font-bold">Portal</span>
        </div>
        <h1 className="mt-6 text-xl font-bold text-cocoa-900">Staff Login</h1>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="rounded-lg border border-brand-200 px-4 py-2 text-sm"
          />
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="rounded-lg border border-brand-200 px-4 py-2 text-sm"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-brand-500 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {submitting ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}
