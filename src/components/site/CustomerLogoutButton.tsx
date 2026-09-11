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
      className="btn-ghost rounded-full px-4 py-2 text-sm font-semibold"
    >
      Log Out
    </button>
  );
}
