import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductArt } from "@/components/site/ProductArt";
import { Reveal } from "@/components/site/Reveal";
import { StatCounter } from "@/components/site/StatCounter";
import { getBusinessProfile } from "@/lib/business";

const FEATURES = [
  {
    icon: "🍰",
    title: "Baked fresh, daily",
    body: "Cakes, pastries, snacks and meals made same-day from quality ingredients — never sitting in a freezer.",
  },
  {
    icon: "🎉",
    title: "Full event planning",
    body: "Weddings, engagements, corporate functions — we plan the menu, cook it and cater the whole occasion.",
  },
  {
    icon: "🛵",
    title: "Fast pickup & delivery",
    body: "Order online and choose pickup or zone-based delivery, tracked live from the kitchen to your door.",
  },
  {
    icon: "💳",
    title: "Pay your way",
    body: "Card, Mobile Money or cash — confirmed instantly through Paystack/Hubtel or verified by our team.",
  },
  {
    icon: "🎁",
    title: "Loyalty rewards",
    body: "Every order earns points toward member-only perks and discounts on your next treat.",
  },
  {
    icon: "📦",
    title: "Custom & bulk orders",
    body: "Bespoke cakes, party trays and bulk catering, made exactly to your spec and headcount.",
  },
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
  const collage = featured.slice(0, 3);

  return (
    <div>
      {/* ---------------------------------------------------------------- HERO */}
      <section className="relative overflow-hidden pt-6 sm:pt-10">
        <div className="aurora-bg" />
        <div className="bg-grid absolute inset-0" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-8">
          <div className="relative z-10 text-center lg:text-left">
            <Reveal>
              <span className="chip mx-auto inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold lg:mx-0" data-active="true">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: "var(--glow-amber)" }} />
                  <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "var(--glow-amber)" }} />
                </span>
                @{business.instagramHandle} · Ordering online now
              </span>
            </Reveal>

            <Reveal delay={0.08}>
              <h1
                className="mx-auto mt-6 max-w-xl font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:mx-0 lg:text-7xl"
                style={{ color: "var(--text-hi)" }}
              >
                Food that steals <span className="text-gradient italic">the show</span>
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mx-auto mt-6 max-w-md text-lg lg:mx-0" style={{ color: "var(--text-mid)" }}>
                {business.tagline} — cakes, pastries, meals and full event catering, made fresh daily and
                delivered across Accra.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <Link href="/menu" className="btn-glow rounded-full px-7 py-3.5 text-sm font-semibold">
                  Order Now →
                </Link>
                <Link href="/custom-orders" className="btn-ghost rounded-full px-7 py-3.5 text-sm font-semibold">
                  Plan an Event ✦
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Asymmetrical floating collage */}
          <div className="relative mx-auto hidden aspect-square w-full max-w-md lg:block">
            <div
              className="blob-shape absolute inset-8 opacity-70 blur-[2px]"
              style={{ background: "linear-gradient(135deg, var(--glow-amber), var(--glow-cyan))" }}
            />
            {collage[0] && (
              <div
                className="glow-card glass absolute left-0 top-2 h-36 w-36 overflow-hidden rounded-2xl shadow-2xl"
                style={{ transform: "rotate(-9deg)" }}
              >
                <ProductArt name={collage[0].name} category={collage[0].category.name} className="h-full w-full" iconClassName="text-4xl" />
              </div>
            )}
            {collage[1] && (
              <div
                className="glow-card glass animate-float absolute right-2 top-20 h-52 w-52 overflow-hidden rounded-3xl shadow-2xl"
                style={{ ["--float-rot" as string]: "4deg", transform: "rotate(4deg)" }}
              >
                <ProductArt name={collage[1].name} category={collage[1].category.name} className="h-full w-full" iconClassName="text-6xl" />
              </div>
            )}
            {collage[2] && (
              <div
                className="glow-card glass absolute bottom-2 left-12 h-32 w-32 overflow-hidden rounded-2xl shadow-2xl"
                style={{ transform: "rotate(11deg)" }}
              >
                <ProductArt name={collage[2].name} category={collage[2].category.name} className="h-full w-full" iconClassName="text-3xl" />
              </div>
            )}
            <div className="glass-strong absolute -bottom-4 right-0 flex items-center gap-2 rounded-2xl px-4 py-3 shadow-xl">
              <span className="text-xl">🎉</span>
              <div className="text-left">
                <p className="text-sm font-bold" style={{ color: "var(--text-hi)" }}>
                  {orderCount || 340}+ events &amp; orders
                </p>
                <p className="text-xs" style={{ color: "var(--text-lo)" }}>catered with care</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- STATS */}
      <section className="relative border-y" style={{ borderColor: "var(--ink-border)" }}>
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
          <StatCounter value={customerCount || 120} suffix="+" label="Happy Customers" />
          <StatCounter value={orderCount || 340} suffix="+" label="Orders Fulfilled" />
          <StatCounter value={Math.round(avgRating * 10) / 10} suffix="★" label="Average Rating" />
          <StatCounter value={30} suffix="min" label="Avg. Prep Time" />
        </div>
      </section>

      {/* ---------------------------------------------------------------- FEATURE GRID */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <div className="mx-auto max-w-xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--glow-amber)" }}>
              Why FudFactory
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl" style={{ color: "var(--text-hi)" }}>
              Not just a kitchen — a whole occasion
            </h2>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 0.06}>
              <div className="glass glow-card h-full rounded-2xl p-6">
                <span
                  className="grid h-12 w-12 place-items-center rounded-xl text-2xl"
                  style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--glow-amber) 22%, transparent), color-mix(in srgb, var(--glow-cyan) 22%, transparent))" }}
                >
                  {feature.icon}
                </span>
                <h3 className="mt-4 font-display text-lg font-bold" style={{ color: "var(--text-hi)" }}>
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-mid)" }}>
                  {feature.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- CATEGORIES */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <Reveal>
            <h2 className="font-display text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-hi)" }}>
              Shop by category
            </h2>
          </Reveal>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {categories.map((category, i) => (
              <Reveal key={category.id} delay={i * 0.04}>
                <Link
                  href={`/menu?category=${category.slug}`}
                  className="glass glow-card block rounded-2xl px-4 py-7 text-center text-sm font-semibold transition-colors hover:text-[var(--glow-amber)]"
                  style={{ color: "var(--text-hi)" }}
                >
                  {category.name}
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- FEATURED */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Reveal>
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-hi)" }}>
              Featured products
            </h2>
            <Link href="/menu" className="text-sm font-semibold transition-colors hover:text-[var(--glow-amber)]" style={{ color: "var(--glow-cyan)" }}>
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

      {/* ---------------------------------------------------------------- ABOUT / DELIVERY */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="glass h-full rounded-3xl p-8">
              <span className="text-3xl">👨‍🍳</span>
              <h2 className="mt-4 font-display text-xl font-bold" style={{ color: "var(--text-hi)" }}>
                About FudFactory
              </h2>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-mid)" }}>
                {business.aboutText ??
                  "FudFactory bakes and prepares meat pies, doughnuts, cakes, snacks and full meals fresh every day. We serve walk-in customers, online orders and full-scale event planning &amp; catering — all made with quality ingredients and a lot of care."}
              </p>
              <Link href="/about" className="mt-4 inline-block text-sm font-semibold transition-colors hover:text-[var(--glow-amber)]" style={{ color: "var(--glow-amber)" }}>
                Learn more about us →
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="glass h-full rounded-3xl p-8">
              <span className="text-3xl">🎪</span>
              <h2 className="mt-4 font-display text-xl font-bold" style={{ color: "var(--text-hi)" }}>
                Events &amp; Catering
              </h2>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-mid)" }}>
                From engagements to corporate functions, our team plans the menu, bakes and cooks the day
                of, and handles setup — a full event-planning service, not just a food order.
              </p>
              <Link href="/custom-orders" className="mt-4 inline-block text-sm font-semibold transition-colors hover:text-[var(--glow-amber)]" style={{ color: "var(--glow-amber)" }}>
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
              className="btn-ghost rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              @{business.instagramHandle} ↗
            </a>
          </div>
        </Reveal>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {galleryProducts.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.04}>
              <div className="glow-card aspect-square overflow-hidden rounded-2xl">
                <ProductArt name={p.name} iconClassName="text-3xl" className="h-full w-full" />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- TESTIMONIALS */}
      {reviews.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <div className="mx-auto max-w-xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--glow-amber)" }}>
                Social proof
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl" style={{ color: "var(--text-hi)" }}>
                What customers say
              </h2>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {reviews.map((review, i) => (
              <Reveal key={review.id} delay={i * 0.08}>
                <div
                  className="glass glow-card relative h-full rounded-2xl p-6"
                  style={{ transform: i === 1 ? "rotate(0deg)" : i === 0 ? "rotate(-1.5deg)" : "rotate(1.5deg)" }}
                >
                  <span
                    className="font-display absolute -top-3 left-5 text-5xl leading-none opacity-40"
                    style={{ color: "var(--glow-amber)" }}
                    aria-hidden
                  >
                    &ldquo;
                  </span>
                  <div style={{ color: "var(--glow-amber)" }}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-mid)" }}>&ldquo;{review.comment}&rdquo;</p>
                  <p className="mt-4 text-sm font-semibold" style={{ color: "var(--text-hi)" }}>{review.customer.name}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- FINAL CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <Reveal>
          <div className="glass-strong relative overflow-hidden rounded-3xl px-8 py-16 text-center">
            <div className="aurora-bg opacity-60" />
            <div className="relative">
              <h2 className="font-display text-3xl font-bold sm:text-4xl" style={{ color: "var(--text-hi)" }}>
                Hungry — or hosting?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: "var(--text-mid)" }}>
                Place an order in under a minute, or tell us about your next event and let us plan the whole thing.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link href="/menu" className="btn-glow inline-block rounded-full px-8 py-3.5 text-sm font-semibold">
                  Order Now →
                </Link>
                <Link href="/custom-orders" className="btn-ghost inline-block rounded-full px-8 py-3.5 text-sm font-semibold">
                  Plan an Event ✦
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
