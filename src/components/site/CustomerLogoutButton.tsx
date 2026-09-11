"use client";

import { useRouter } from "next/navigation";

export function CustomerLogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/auth/customer/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
      className="rounded-full border border-brand-300 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
    >
      Log Out
    </button>
  );
}
