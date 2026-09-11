"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartContext";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/promotions", label: "Promotions" },
  { href: "/custom-orders", label: "Custom Orders" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-[var(--background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-500 text-sm font-bold text-white">
            FF
          </span>
          <span className="text-lg font-bold tracking-tight text-brand-800">FudFactory</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-cocoa-900 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-brand-600">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/account"
            className="hidden text-sm font-medium text-cocoa-900 transition hover:text-brand-600 sm:block"
          >
            Account
          </Link>
          <Link
            href="/cart"
            className="relative inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
          >
            Cart
            {count > 0 && (
              <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-xs font-bold text-brand-700">
                {count}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-md border border-brand-200 text-brand-700 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-brand-100 bg-[var(--background)] px-4 py-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-2 py-2 text-sm font-medium text-cocoa-900 hover:bg-brand-50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="block rounded-md px-2 py-2 text-sm font-medium text-cocoa-900 hover:bg-brand-50"
              >
                Account
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
