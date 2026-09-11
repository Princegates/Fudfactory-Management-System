"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReviewForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, rating, comment }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not submit review.");
      return;
    }
    setDone(true);
    router.refresh();
  }

  if (done) return <p className="text-sm text-green-400">Thanks for your review!</p>;

  return (
    <div className="glass mt-2 rounded-lg p-3">
      <div className="flex gap-1" style={{ color: "var(--glow-amber)" }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} className="text-lg">
            {n <= rating ? "★" : "☆"}
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Tell us about your experience..."
        rows={2}
        className="input-dark mt-2 w-full rounded-lg px-3 py-2 text-sm"
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      <button
        type="button"
        onClick={submit}
        disabled={submitting}
        className="btn-glow mt-2 rounded-md px-4 py-1.5 text-xs font-semibold disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
}
