import type { Metadata } from "next";
import { getBusinessProfile } from "@/lib/business";
import { Reveal } from "@/components/site/Reveal";
import { Icon, type IconName } from "@/components/site/Icon";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about FudFactory — a Ghanaian food, pastry and catering business.",
};

const OFFERINGS: { icon: IconName; label: string }[] = [
  { icon: "gift", label: "Food hampers" },
  { icon: "egg", label: "Breakfast for groups" },
  { icon: "donut", label: "Starters & finger foods" },
  { icon: "bowl", label: "Soups & stews" },
  { icon: "chef", label: "Lunch for groups" },
  { icon: "pastry", label: "Pastries" },
  { icon: "event", label: "Full event planning services" },
  { icon: "cup", label: "Drinks" },
];

export default async function AboutPage() {
  const business = await getBusinessProfile();

  return (
    <div className="relative">
      <div className="aurora-bg opacity-30" />
      <div className="relative mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <Reveal>
          <span className="dept-label">Our Story</span>
          <h1 className="mt-3 font-display text-4xl font-bold" style={{ color: "var(--text-hi)" }}>
            About <span className="italic" style={{ color: "var(--glow-amber)" }}>{business.businessName}</span>
          </h1>
        </Reveal>

        <Reveal delay={0.08}>
          <p className="dropcap mt-6 leading-loose" style={{ color: "var(--text-mid)" }}>
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
          <span className="dept-label mt-14">What we offer</span>
          <ul className="mt-2 grid sm:grid-cols-2 sm:gap-x-8">
            {OFFERINGS.map((item, i) => (
              <li
                key={item.label}
                className="flex items-center gap-3 py-3.5 text-sm font-medium"
                style={{ color: "var(--text-hi)", borderTop: i > 1 ? "1px solid var(--ink-border)" : undefined }}
              >
                <Icon name={item.icon} className="h-5 w-5 shrink-0" style={{ color: "var(--glow-amber)" }} />
                {item.label}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.24}>
          <span className="dept-label mt-14">Find Us</span>
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
