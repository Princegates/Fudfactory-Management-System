import type { Metadata } from "next";
import { WhatsAppContactForm } from "@/components/site/WhatsAppContactForm";
import { getBusinessProfile } from "@/lib/business";
import { Reveal } from "@/components/site/Reveal";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with FudFactory for orders, catering and enquiries.",
};

export default async function ContactPage() {
  const business = await getBusinessProfile();

  const items = [
    { label: "Location", value: business.address },
    { label: "Phone / WhatsApp", value: business.phone },
    { label: "Email", value: business.email },
  ];

  return (
    <div className="relative">
      <div className="aurora-bg opacity-30" />
      <div className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <Reveal>
          <h1 className="font-display text-4xl font-bold" style={{ color: "var(--text-hi)" }}>
            Contact <span className="text-gradient">Us</span>
          </h1>
          <p className="mt-2" style={{ color: "var(--text-mid)" }}>
            We&apos;d love to hear from you — reach out any time.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Reveal delay={0.06}>
            <div className="glass h-full space-y-5 rounded-2xl p-6">
              {items.map((item) => (
                <div key={item.label}>
                  <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--glow-amber)" }}>
                    {item.label}
                  </h2>
                  <p className="mt-1" style={{ color: "var(--text-hi)" }}>{item.value}</p>
                </div>
              ))}
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--glow-amber)" }}>
                  Instagram
                </h2>
                <a
                  href={`https://instagram.com/${business.instagramHandle}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block hover:underline"
                  style={{ color: "var(--glow-cyan)" }}
                >
                  @{business.instagramHandle}
                </a>
              </div>
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--glow-amber)" }}>
                  Hours
                </h2>
                {business.businessHours.split("\n").map((line) => (
                  <p key={line} style={{ color: "var(--text-hi)" }}>{line}</p>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="glass-strong h-full rounded-2xl p-6">
              <h2 className="font-display text-lg font-bold" style={{ color: "var(--text-hi)" }}>
                Send us a message
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--text-lo)" }}>
                This opens WhatsApp with your message pre-filled.
              </p>
              <div className="mt-5">
                <WhatsAppContactForm />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
