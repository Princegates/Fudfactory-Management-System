import Link from "next/link";
import { getBusinessProfile } from "@/lib/business";

export async function Footer() {
  const business = await getBusinessProfile();
  return (
    <footer className="mt-16 border-t border-brand-100 bg-brand-900 text-brand-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-500 text-sm font-bold text-white">
              FF
            </span>
            <span className="text-lg font-bold">{business.businessName}</span>
          </div>
          <p className="mt-3 text-sm text-brand-100">
            {business.tagline}
          </p>
          <a
            href={`https://instagram.com/${business.instagramHandle}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-sm font-medium text-brand-200 hover:text-white"
          >
            @{business.instagramHandle} on Instagram
          </a>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-200">Explore</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/menu" className="hover:text-white">Menu</Link></li>
            <li><Link href="/gallery" className="hover:text-white">Gallery</Link></li>
            <li><Link href="/promotions" className="hover:text-white">Promotions</Link></li>
            <li><Link href="/custom-orders" className="hover:text-white">Custom &amp; Event Orders</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-200">Account</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/account" className="hover:text-white">My Account</Link></li>
            <li><Link href="/track" className="hover:text-white">Track an Order</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
            <li><Link href="/portal/login" className="hover:text-white">Staff Login</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-200">Get in touch</h3>
          <ul className="mt-3 space-y-2 text-sm text-brand-100">
            <li>{business.address}</li>
            <li>{business.phone}</li>
            <li>{business.email}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-800 py-4 text-center text-xs text-brand-200">
        © {new Date().getFullYear()} {business.businessName}. All rights reserved.
      </div>
    </footer>
  );
}
