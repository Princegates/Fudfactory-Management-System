"use client";

import { useState, ReactNode } from "react";
import { NavItem } from "@/lib/permissions";
import { PortalNav } from "./PortalNav";
import { StaffLogoutButton } from "./StaffLogoutButton";
import { Logo } from "@/components/Logo";

export function PortalShell({
  items,
  staffName,
  staffRole,
  children,
}: {
  items: NavItem[];
  staffName: string;
  staffRole: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-brand-50/40">
      <aside className="hidden w-64 shrink-0 border-r border-brand-100 bg-white p-4 md:block">
        <SidebarHeader />
        <div className="mt-6">
          <PortalNav items={items} />
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-64 overflow-y-auto bg-white p-4 shadow-xl">
            <SidebarHeader />
            <div className="mt-6">
              <PortalNav items={items} />
            </div>
          </div>
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="flex-1 bg-black/30"
          />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-brand-100 bg-white px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-md border border-brand-200 text-brand-700 md:hidden"
          >
            ☰
          </button>
          <div className="text-sm">
            <p className="font-semibold text-cocoa-900">{staffName}</p>
            <p className="text-xs text-cocoa-900/50">{staffRole.replace(/_/g, " ")}</p>
          </div>
          <StaffLogoutButton />
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

function SidebarHeader() {
  return <Logo className="h-7" themed={false} />;
}
