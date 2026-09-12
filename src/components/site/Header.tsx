"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "./CartContext";
import { ModeToggle } from "./ModeToggle";
import { Logo } from "@/components/Logo";

const NAV_LINKS = [
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

  const utilityLinks = (
    <div className="flex items-center gap-3">
      <ModeToggle mode={mode} />
      <Link href="/account" className="hidden text-xs font-medium tracking-wide transition-colors hover:text-[var(--glow-amber)] sm:block" style={{ color: "var(--text-mid)" }}>
        Account
      </Link>
      <Link href="/portal/login" className="hidden text-xs font-medium tracking-wide transition-colors hover:text-[var(--glow-amber)] lg:block" style={{ color: "var(--text-lo)" }}>
        Staff Login
      </Link>
      <Link href="/cart" className="relative inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest transition-colors hover:text-[var(--glow-amber)]" style={{ color: "var(--text-hi)" }}>
        Cart
        {count > 0 && (
          <span
            className="grid h-4 w-4 place-items-center rounded-full text-[10px] font-bold"
            style={{ background: "var(--glow-amber)", color: "#fdf8ef" }}
          >
            {count}
          </span>
        )}
      </Link>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="grid h-9 w-9 place-items-center text-lg md:hidden"
        style={{ color: "var(--text-hi)" }}
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        {open ? "✕" : "☰"}
      </button>
    </div>
  );

  const navList = (
    <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs font-semibold uppercase tracking-[0.14em]">
      {NAV_LINKS.map((link, i) => {
        const active = pathname === link.href;
        return (
          <li key={link.href} className="flex items-center gap-6">
            <Link
              href={link.href}
              className="transition-colors hover:text-[var(--glow-amber)]"
              style={{ color: active ? "var(--glow-amber)" : "var(--text-mid)" }}
            >
              {link.label}
            </Link>
            {i < NAV_LINKS.length - 1 && (
              <span aria-hidden className="hidden md:inline" style={{ color: "var(--ink-border-strong)" }}>
                /
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? "glass-strong shadow-[0_8px_32px_-16px_rgba(0,0,0,0.5)]" : "border-b"
      }`}
      style={!scrolled ? { borderColor: "var(--ink-border)" } : undefined}
    >
      {/* Compact bar: always this on mobile, and on desktop once scrolled */}
      <div className={`mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 ${scrolled ? "py-3" : "py-3 md:hidden"}`}>
        <Link href="/" className="flex shrink-0 items-center">
          <Logo className="h-7" />
        </Link>
        <nav className="hidden md:block">{navList}</nav>
        {utilityLinks}
      </div>

      {/* Full masthead: desktop only, only at the top of the page */}
      {!scrolled && (
        <div className="hidden md:block">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-3 text-xs">
            <span className="tracking-[0.14em]" style={{ color: "var(--text-lo)" }}>
              Fresh Bakes, Delivered Daily
            </span>
            {utilityLinks}
          </div>
          <div className="mx-auto max-w-6xl px-6 py-5 text-center">
            <Link href="/" className="inline-flex items-center">
              <Logo className="h-11" />
            </Link>
          </div>
          <div className="border-t" style={{ borderColor: "var(--ink-border)" }}>
            <div className="mx-auto max-w-6xl px-6 py-3">{navList}</div>
          </div>
        </div>
      )}

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
            <li>
              <Link
                href="/portal/login"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-white/5"
                style={{ color: "var(--text-mid)" }}
              >
                Staff Login
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
