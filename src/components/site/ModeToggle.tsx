"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

const MODE_COOKIE = "ff_site_mode";

export function ModeToggle({ mode }: { mode: "dark" | "light" }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = mode === "dark" ? "light" : "dark";
    document.cookie = `${MODE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => router.refresh());
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      className="mode-toggle"
      aria-label={mode === "dark" ? "Switch to day mode" : "Switch to night mode"}
      aria-pressed={mode === "light"}
      title={mode === "dark" ? "Switch to day mode" : "Switch to night mode"}
    >
      <span className="mode-toggle__thumb" aria-hidden>
        {mode === "dark" ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
