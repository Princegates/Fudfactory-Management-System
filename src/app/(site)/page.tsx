import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductArt } from "@/components/site/ProductArt";
import { Reveal } from "@/components/site/Reveal";
import { StatCounter } from "@/components/site/StatCounter";
import { Icon } from "@/components/site/Icon";
import { HeroVisual } from "@/components/site/HeroVisual";
import { getBusinessProfile } from "@/lib/business";

const FEATURES: { title: string; body: string }[] = [
  {
    title: "Baked fresh, daily",
    body: "Cakes, pastries, snacks and meals made same-day from quality ingredients — never sitting in a freezer.",
  },
  {
    title: "Full event planning",
    body: "Weddings, engagements, corporate functions — we plan the menu, cook it and cater the whole occasion.",
  },
  {
    title: "Fast pickup & delivery",
    body: "Order online and choose pickup or zone-based delivery, tracked live from the kitchen to your door.",
  },
  {
    title: "Pay your way",
    body: "Card, Mobile Money or cash — confirmed instantly through Paystack/Hubtel or verified by our team.",
  },
  {
    title: "Loyalty rewards",
    body: "Every order earns points toward member-only perks and discounts on your next treat.",
  },
  {
    title: "Custom & bulk orders",
    body: "Bespoke cakes, party trays and bulk catering, made exactly to your spec and headcount.",
  },
];

const TICKER = ["Baked fresh daily", "Full event planning", "Pickup & delivery", "Secure payments", "Loyalty rewards"];

const HERO_INDEX: { n: string; title: string; body: string; href: string }[] = [
  { n: "01", title: "The Menu", body: "Fresh bakes, meals & full catering", href: "/menu" },
  { n: "02", title: "Events", body: "Weddings, corporate & full planning", href: "/custom-orders" },
  { n: "03", title: "Track", body: "Follow your order, live", href: "/track" },
];

export default async function HomePage() {
  const [featured, categories, reviews, business, customerCount, orderCount, avgRatingAgg] = await Promise.all([
    prisma.product.findMany({
      where: { isAvailable: true, isFeatured: true },
      include: { category: true },
      take: 8,
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, take: 6 }),
    prisma.review.findMany({
      where: { isApproved: true },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    getBusinessProfile(),
    prisma.customer.count(),
    prisma.order.count({ where: { status: { not: "CANCELLED" } } }),
    prisma.review.aggregate({ _avg: { rating: true }, where: { isApproved: true } }),
  ]);

  const avgRating = avgRatingAgg._avg.rating ?? 5;
  const galleryProducts = await prisma.product.findMany({ orderBy: { createdAt: "desc" }, take: 6 });

  return (
    <div>
      {/* ---------------------------------------------------------------- HERO */}
      <section className="relative overflow-hidden pt-2 sm:pt-4">
        <div className="aurora-bg" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-8">
          <div className="relative z-10 text-center lg:text-left">
            <Reveal>
              <h1
                className="mx-auto max-w-xl font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:mx-0 lg:text-7xl"
                style={{ color: "var(--text-hi)" }}
              >
                Food that steals <span className="italic" style={{ color: "var(--glow-amber)" }}>the show</span>
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p
                className="mx-auto mt-6 max-w-md text-2xl lg:mx-0"
                style={{ color: "var(--text-mid)", fontFamily: "var(--font-script), cursive" }}
              >
                {business.tagline} — cakes, pastries, meals and full event catering, made fresh daily and
                delivered across Accra.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <Link href="/menu" className="btn-glow mt-8 inline-block rounded-md px-7 py-3.5 text-sm font-semibold">
                Order Now
              </Link>
            </Reveal>

            <Reveal delay={0.32}>
              <div className="mx-auto mt-8 max-w-md text-left lg:mx-0">
                {HERO_INDEX.map((item, i) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center gap-4 py-3"
                    style={i > 0 ? { borderTop: "1px solid var(--ink-border)" } : undefined}
                  >
                    <span className="index-number text-lg">{item.n}</span>
                    <span className="flex-1">
                      <span className="font-display font-bold" style={{ color: "var(--text-hi)" }}>{item.title}</span>
                      <span className="ml-2 text-sm" style={{ color: "var(--text-mid)" }}>{item.body}</span>
                    </span>
                    <span aria-hidden className="transition-transform group-hover:translate-x-1" style={{ color: "var(--glow-amber)" }}>
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>

          {/* 3D brand centerpiece (falls back to the flat animated logo if WebGL isn't available) */}
          <div className="relative mx-auto flex w-full max-w-md flex-col items-center justify-center">
            <div className="flex h-40 w-40 items-center justify-center sm:h-52 sm:w-52 lg:h-64 lg:w-64">
              <HeroVisual />
            </div>
            <p className="mt-4 text-xs italic tracking-wide" style={{ color: "var(--text-lo)" }}>
              — from the FudFactory kitchen, Accra
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- TICKER */}
      <div className="marquee border-y py-3" style={{ borderColor: "var(--ink-border)" }}>
        <div className="marquee__track">
          {[...TICKER, ...TICKER].map((item, i) => (
            <span key={i} className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em] whitespace-nowrap" style={{ color: "var(--text-mid)" }}>
              {item}
              <span aria-hidden style={{ color: "var(--glow-amber)" }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------------------- STATS */}
      <section className="relative border-b" style={{ borderColor: "var(--ink-border)" }}>
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
          <StatCounter value={Math.max(customerCount, 1000)} suffix="+" label="Happy Customers" />
          <StatCounter value={Math.max(orderCount, 3000)} suffix="+" label="Orders Fulfilled" />
          <StatCounter value={Math.round(avgRating * 10) / 10} suffix="★" label="Average Rating" />
          <StatCounter value={30} suffix="min" label="Avg. Prep Time" />
        </div>
      </section>

      {/* ---------------------------------------------------------------- FEATURE INDEX */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <div className="flex items-end justify-between gap-6">
            <h2 className="font-display text-3xl font-bold sm:text-4xl" style={{ color: "var(--text-hi)" }}>
              Not just a kitchen — <span className="italic" style={{ color: "var(--glow-amber)" }}>a whole occasion</span>
            </h2>
            <span className="dept-label hidden shrink-0 sm:flex sm:w-32">In this issue</span>
          </div>
        </Reveal>
        <div className="mt-8 grid gap-x-10 sm:grid-cols-2">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 0.05}>
              <div className="index-row">
                <span className="index-number">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-display text-lg font-bold" style={{ color: "var(--text-hi)" }}>
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--text-mid)" }}>
                    {feature.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- CATEGORIES */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <Reveal>
            <span className="dept-label">Sections</span>
          </Reveal>
          <div className="mt-4 grid gap-x-10 sm:grid-cols-2">
            {categories.map((category, i) => (
              <Reveal key={category.id} delay={i * 0.04}>
                <Link
                  href={`/menu?category=${category.slug}`}
                  className="group flex items-center justify-between gap-4 py-4"
                  style={i > 1 ? { borderTop: "1px solid var(--ink-border)" } : undefined}
                >
                  <span
                    className="font-display text-xl font-bold transition-colors group-hover:text-[var(--glow-amber)] sm:text-2xl"
                    style={{ color: "var(--text-hi)" }}
                  >
                    {category.name}
                  </span>
                  <span aria-hidden className="transition-transform group-hover:translate-x-1" style={{ color: "var(--glow-amber)" }}>
                    →
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- FEATURED */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Reveal>
          <div className="flex items-end justify-between gap-6">
            <div>
              <span className="dept-label" style={{ minWidth: "6rem" }}>Featured</span>
              <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-hi)" }}>
                This week&apos;s picks
              </h2>
            </div>
            <Link href="/menu" className="shrink-0 text-sm font-semibold transition-colors hover:text-[var(--glow-amber)]" style={{ color: "var(--glow-cyan)" }}>
              View all →
            </Link>
          </div>
        </Reveal>
        {featured.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {featured.map((product, i) => (
              <Reveal key={product.id} delay={i * 0.05}>
                <ProductCard
                  id={product.id}
                  slug={product.slug}
                  name={product.name}
                  price={product.price}
                  imageUrl={product.imageUrl}
                  categoryName={product.category.name}
                  isAvailable={product.isAvailable}
                />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm" style={{ color: "var(--text-lo)" }}>
            No featured products yet — check back soon or browse the full{" "}
            <Link href="/menu" className="underline" style={{ color: "var(--glow-amber)" }}>
              menu
            </Link>
            .
          </p>
        )}
      </section>

      {/* ---------------------------------------------------------------- ABOUT / EVENTS */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <Reveal>
            <span className="dept-label">The Story</span>
            <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-hi)" }}>
              About FudFactory
            </h2>
            <p className="dropcap mt-4 max-w-2xl text-[15px] leading-loose" style={{ color: "var(--text-mid)" }}>
              {business.aboutText ??
                "FudFactory bakes and prepares meat pies, doughnuts, cakes, snacks and full meals fresh every day. We serve walk-in customers, online orders and full-scale event planning & catering — all made with quality ingredients and a lot of care."}
            </p>
            <Link href="/about" className="mt-4 inline-block text-sm font-semibold transition-colors hover:text-[var(--glow-amber)]" style={{ color: "var(--glow-amber)" }}>
              Learn more about us →
            </Link>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="h-full border-l pl-6" style={{ borderColor: "var(--glow-amber)" }}>
              <Icon name="event" className="h-7 w-7" style={{ color: "var(--glow-amber)" }} />
              <h2 className="mt-3 font-display text-lg font-bold" style={{ color: "var(--text-hi)" }}>
                Events &amp; Catering
              </h2>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-mid)" }}>
                From engagements to corporate functions, our team plans the menu, bakes and cooks the day
                of, and handles setup — a full event-planning service, not just a food order.
              </p>
              <Link href="/custom-orders" className="mt-3 inline-block text-sm font-semibold transition-colors hover:text-[var(--glow-amber)]" style={{ color: "var(--glow-amber)" }}>
                Request a quote →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------------- INSTAGRAM CALLOUT */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-hi)" }}>
                As seen on Instagram
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--text-mid)" }}>
                Follow the kitchen in real time.
              </p>
            </div>
            <a
              href={`https://instagram.com/${business.instagramHandle}`}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost rounded-md px-5 py-2.5 text-sm font-semibold"
            >
              @{business.instagramHandle}
            </a>
          </div>
        </Reveal>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {galleryProducts.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.04}>
              <div className="glow-card aspect-square overflow-hidden rounded-lg">
                <ProductArt name={p.name} iconClassName="h-8 w-8" className="h-full w-full" />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- TESTIMONIALS */}
      {reviews.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <span className="dept-label">What customers say</span>
          </Reveal>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            <Reveal>
              <div className="pull-quote">
                <div style={{ color: "var(--glow-amber)" }}>
                  {"★".repeat(reviews[0].rating)}
                  {"☆".repeat(5 - reviews[0].rating)}
                </div>
                <blockquote className="mt-3 text-2xl sm:text-3xl" style={{ color: "var(--text-hi)" }}>
                  &ldquo;{reviews[0].comment}&rdquo;
                </blockquote>
                <p className="mt-4 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--text-mid)" }}>
                  — {reviews[0].customer.name}
                </p>
              </div>
            </Reveal>
            {reviews.length > 1 && (
              <div>
                {reviews.slice(1).map((review, i) => (
                  <Reveal key={review.id} delay={0.08 + i * 0.08}>
                    <div className="py-4" style={i > 0 ? { borderTop: "1px solid var(--ink-border)" } : undefined}>
                      <div className="text-xs" style={{ color: "var(--glow-amber)" }}>
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-mid)" }}>&ldquo;{review.comment}&rdquo;</p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-lo)" }}>
                        — {review.customer.name}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- FINAL CTA */}
      <section className="mx-auto max-w-6xl border-t px-4 pb-24 pt-16 sm:px-6" style={{ borderColor: "var(--ink-border)" }}>
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
            <h2 className="max-w-lg font-display text-3xl font-bold sm:text-4xl" style={{ color: "var(--text-hi)" }}>
              Hungry — or <span className="italic" style={{ color: "var(--glow-amber)" }}>hosting?</span>
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/menu" className="btn-glow inline-block rounded-md px-8 py-3.5 text-sm font-semibold">
                Order Now
              </Link>
              <Link href="/custom-orders" className="btn-ghost inline-block rounded-md px-8 py-3.5 text-sm font-semibold">
                Plan an Event
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
