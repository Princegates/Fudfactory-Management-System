import type { Metadata } from "next";
import { getBusinessProfile } from "@/lib/business";
import { Reveal } from "@/components/site/Reveal";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about FudFactory — a Ghanaian food, pastry and catering business.",
};

const OFFERINGS = [
  { icon: "🎂", label: "Cakes & celebration bakes" },
  { icon: "🥐", label: "Pastries & pies" },
  { icon: "🍩", label: "Snacks & breakfast items" },
  { icon: "🍚", label: "Rice & spaghetti cuisine" },
  { icon: "🍌", label: "Yam & plantain dishes" },
  { icon: "🎉", label: "Corporate & bulk catering" },
];

export default async function AboutPage() {
  const business = await getBusinessProfile();

  return (
    <div className="relative">
      <div className="aurora-bg opacity-30" />
      <div className="relative mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--glow-amber)" }}>
            Our Story
          </span>
          <h1 className="mt-2 font-display text-4xl font-bold" style={{ color: "var(--text-hi)" }}>
            About <span className="text-gradient">{business.businessName}</span>
          </h1>
        </Reveal>

        <Reveal delay={0.08}>
          <p className="mt-6 leading-relaxed" style={{ color: "var(--text-mid)" }}>
            {business.tagline} — FudFactory started as a small home kitchen serving neighbours fresh
            meat pies and doughnuts, and has grown into a full food, pastry and catering business
            trusted for birthdays, weddings, corporate events and everyday cravings.
          </p>
          <p className="mt-4 leading-relaxed" style={{ color: "var(--text-mid)" }}>
            Everything we sell — from our signature meat pies to custom celebration cakes — is baked
            and prepared fresh using quality ingredients. We run our own kitchen, production planning
            and delivery so that what you order online is exactly what turns up at your door.
          </p>
        </Reveal>

        <Reveal delay={0.16}>
          <h2 className="mt-14 font-display text-2xl font-bold" style={{ color: "var(--text-hi)" }}>
            What we offer
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {OFFERINGS.map((item) => (
              <li
                key={item.label}
                className="glass glow-card flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium"
                style={{ color: "var(--text-hi)" }}
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.24}>
          <h2 className="mt-14 font-display text-2xl font-bold" style={{ color: "var(--text-hi)" }}>
            Find us
          </h2>
          <p className="mt-3" style={{ color: "var(--text-mid)" }}>
            {business.address} · Follow us on Instagram at{" "}
            <a
              href={`https://instagram.com/${business.instagramHandle}`}
              target="_blank"
              rel="noreferrer"
              className="font-semibold hover:underline"
              style={{ color: "var(--glow-cyan)" }}
            >
              @{business.instagramHandle}
            </a>
          </p>
        </Reveal>
      </div>
    </div>
  );
}
