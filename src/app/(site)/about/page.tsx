import type { Metadata } from "next";
import { getBusinessProfile } from "@/lib/business";
import { Reveal } from "@/components/site/Reveal";
import { Icon, type IconName } from "@/components/site/Icon";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about FudFactory — a Ghanaian food, pastry and catering business.",
};

const OFFERINGS: { icon: IconName; label: string }[] = [
  { icon: "cake", label: "Cakes & celebration bakes" },
  { icon: "pastry", label: "Pastries & pies" },
  { icon: "donut", label: "Snacks & breakfast items" },
  { icon: "bowl", label: "Rice & spaghetti cuisine" },
  { icon: "box", label: "Yam & plantain dishes" },
  { icon: "gift", label: "Corporate & bulk catering" },
  { icon: "event", label: "Full event planning services" },
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
            About <span className="italic" style={{ color: "var(--glow-amber)" }}>{business.businessName}</span>
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
                className="glass glow-card flex items-center gap-3 rounded-lg px-4 py-3.5 text-sm font-medium"
                style={{ color: "var(--text-hi)" }}
              >
                <Icon name={item.icon} className="h-5 w-5 shrink-0" style={{ color: "var(--glow-amber)" }} />
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
