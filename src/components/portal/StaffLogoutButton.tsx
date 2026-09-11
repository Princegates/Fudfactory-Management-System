"use client";

import { useRouter } from "next/navigation";

export function StaffLogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/auth/staff/logout", { method: "POST" });
        router.push("/portal/login");
        router.refresh();
      }}
      className="rounded-full border border-brand-200 px-4 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
    >
      Log Out
    </button>
  );
}
