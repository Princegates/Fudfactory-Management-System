"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "./CartContext";
import { ModeToggle } from "./ModeToggle";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/promotions", label: "Promotions" },
  { href: "/custom-orders", label: "Events & Custom" },
  { href: "/contact", label: "Contact" },
];

export function Header({ mode }: { mode: "dark" | "light" }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? "glass-strong shadow-[0_8px_32px_-16px_rgba(0,0,0,0.5)]" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <span
            className="relative grid h-9 w-9 rotate-[-4deg] place-items-center rounded-lg text-sm font-bold transition-transform group-hover:rotate-0"
            style={{ background: "var(--glow-amber)", color: "#fdf8ef" }}
          >
            FF
          </span>
          <span className="font-display text-lg font-bold tracking-tight" style={{ color: "var(--text-hi)" }}>
            FudFactory
          </span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative rounded-full px-3.5 py-2 transition-colors hover:text-[var(--glow-amber)]"
                style={{ color: active ? "var(--glow-amber)" : "var(--text-mid)" }}
              >
                {link.label}
                {active && (
                  <span
                    className="absolute inset-x-3 -bottom-0.5 h-0.5"
                    style={{ background: "var(--glow-amber)" }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          <ModeToggle mode={mode} />
          <Link
            href="/account"
            className="hidden rounded-full px-3.5 py-2 text-sm font-medium transition-colors hover:text-[var(--glow-amber)] sm:block"
            style={{ color: "var(--text-mid)" }}
          >
            Account
          </Link>
          <Link href="/cart" className="btn-glow relative inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold">
            Cart
            {count > 0 && (
              <span className="grid h-5 w-5 place-items-center rounded-full bg-ink-950 text-xs font-bold text-glow-amber">
                {count}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="glass grid h-10 w-10 place-items-center rounded-xl text-lg md:hidden"
            style={{ color: "var(--text-hi)" }}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {open && (
        <nav className="glass-strong border-t px-4 py-3 md:hidden" style={{ borderColor: "var(--ink-border)" }}>
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-white/5"
                  style={{ color: "var(--text-hi)" }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-white/5"
                style={{ color: "var(--text-hi)" }}
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
