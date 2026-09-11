import type { Metadata } from "next";
import { WhatsAppContactForm } from "@/components/site/WhatsAppContactForm";
import { getBusinessProfile } from "@/lib/business";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with FudFactory for orders, catering and enquiries.",
};

export default async function ContactPage() {
  const business = await getBusinessProfile();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-cocoa-900">Contact Us</h1>
      <p className="mt-2 text-cocoa-900/70">We&apos;d love to hear from you — reach out any time.</p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div className="space-y-4 text-cocoa-900/80">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-500">Location</h2>
            <p>{business.address}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-500">Phone / WhatsApp</h2>
            <p>{business.phone}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-500">Email</h2>
            <p>{business.email}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-500">Instagram</h2>
            <a href={`https://instagram.com/${business.instagramHandle}`} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
              @{business.instagramHandle}
            </a>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-500">Hours</h2>
            <p>Mon – Sat: 8:00am – 8:00pm</p>
            <p>Sunday: 12:00pm – 6:00pm</p>
          </div>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-cocoa-900">Send us a message</h2>
          <p className="mt-1 text-sm text-cocoa-900/60">This opens WhatsApp with your message pre-filled.</p>
          <div className="mt-4">
            <WhatsAppContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
