import Link from "next/link";
import { getBusinessProfile } from "@/lib/business";

export async function Footer() {
  const business = await getBusinessProfile();
  return (
    <footer className="relative mt-20 border-t" style={{ borderColor: "var(--ink-border)" }}>
      <div className="divider-glow absolute top-0 left-0 right-0" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 rotate-[-6deg] place-items-center rounded-xl bg-gradient-to-br from-glow-amber to-glow-amber-strong text-sm font-bold text-ink-950 shadow-[0_0_20px_-4px_var(--glow-amber-strong)]">
              FF
            </span>
            <span className="font-display text-lg font-bold" style={{ color: "var(--text-hi)" }}>
              {business.businessName}
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--text-mid)" }}>
            {business.tagline}
          </p>
          <a
            href={`https://instagram.com/${business.instagramHandle}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-glow-amber"
            style={{ color: "var(--glow-cyan)" }}
          >
            @{business.instagramHandle} on Instagram ↗
          </a>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--glow-amber)" }}>
            Explore
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm" style={{ color: "var(--text-mid)" }}>
            <li><Link href="/menu" className="transition-colors hover:text-white">Menu</Link></li>
            <li><Link href="/gallery" className="transition-colors hover:text-white">Gallery</Link></li>
            <li><Link href="/promotions" className="transition-colors hover:text-white">Promotions</Link></li>
            <li><Link href="/custom-orders" className="transition-colors hover:text-white">Custom Orders &amp; Event Planning</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--glow-amber)" }}>
            Account
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm" style={{ color: "var(--text-mid)" }}>
            <li><Link href="/account" className="transition-colors hover:text-white">My Account</Link></li>
            <li><Link href="/track" className="transition-colors hover:text-white">Track an Order</Link></li>
            <li><Link href="/contact" className="transition-colors hover:text-white">Contact Us</Link></li>
            <li><Link href="/portal/login" className="transition-colors hover:text-white">Staff Login</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--glow-amber)" }}>
            Get in touch
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm" style={{ color: "var(--text-mid)" }}>
            <li>{business.address}</li>
            <li>{business.phone}</li>
            <li>{business.email}</li>
          </ul>
        </div>
      </div>
      <div className="border-t py-5 text-center text-xs" style={{ borderColor: "var(--ink-border)", color: "var(--text-lo)" }}>
        © {new Date().getFullYear()} {business.businessName}. All rights reserved.
      </div>
    </footer>
  );
}
