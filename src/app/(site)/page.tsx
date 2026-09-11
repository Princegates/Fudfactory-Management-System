import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductArt } from "@/components/site/ProductArt";
import { Reveal } from "@/components/site/Reveal";
import { StatCounter } from "@/components/site/StatCounter";
import { getBusinessProfile } from "@/lib/business";

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
      <section className="relative overflow-hidden">
        <div className="aurora-bg" />
        <div className="bg-grid absolute inset-0" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-7 px-4 py-24 text-center sm:px-6 sm:py-32">
          <Reveal>
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold" style={{ color: "var(--glow-amber)" }}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: "var(--glow-amber)" }} />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "var(--glow-amber)" }} />
              </span>
              @{business.instagramHandle} · Ordering online now
            </span>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="max-w-3xl font-display text-5xl font-bold tracking-tight sm:text-7xl" style={{ color: "var(--text-hi)" }}>
              <span className="text-gradient">Your Favorite Chef,</span>
              <br />
              Delivered to Your Door
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="max-w-xl text-lg" style={{ color: "var(--text-mid)" }}>
              {business.tagline} — cakes, pastries, meals and catering made fresh daily. Order online,
              track every step, and taste why Accra keeps coming back.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/menu" className="btn-glow rounded-full px-7 py-3.5 text-sm font-semibold">
                Order Now →
              </Link>
              <Link href="/menu" className="btn-ghost rounded-full px-7 py-3.5 text-sm font-semibold">
                View Menu
              </Link>
              <Link href="/contact" className="btn-ghost rounded-full px-7 py-3.5 text-sm font-semibold">
                Contact Us
              </Link>
            </div>
          </Reveal>

          {/* Floating showcase cards */}
          <div className="pointer-events-none mt-8 hidden w-full max-w-3xl items-end justify-center gap-6 md:flex">
            {featured.slice(0, 3).map((p, i) => (
              <div
                key={p.id}
                className="glow-card glass animate-float overflow-hidden rounded-2xl"
                style={{
                  width: i === 1 ? 160 : 130,
                  height: i === 1 ? 160 : 130,
                  animationDelay: `${i * 0.7}s`,
                  marginBottom: i === 1 ? 24 : 0,
                }}
              >
                <ProductArt name={p.name} category={p.category.name} className="h-full w-full" iconClassName="text-4xl" />
              </div>
            ))}
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

      {/* ---------------------------------------------------------------- CATEGORIES */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
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
                  className="glass glow-card block rounded-2xl px-4 py-7 text-center text-sm font-semibold transition-colors hover:text-glow-amber"
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
            <Link href="/menu" className="text-sm font-semibold transition-colors hover:text-glow-amber" style={{ color: "var(--glow-cyan)" }}>
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
                  "FudFactory bakes and prepares meat pies, doughnuts, cakes, snacks and full meals fresh every day. We serve walk-in customers, online orders and full-scale event catering — all made with quality ingredients and a lot of care."}
              </p>
              <Link href="/about" className="mt-4 inline-block text-sm font-semibold transition-colors hover:text-glow-amber" style={{ color: "var(--glow-amber)" }}>
                Learn more about us →
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="glass h-full rounded-3xl p-8">
              <span className="text-3xl">🛵</span>
              <h2 className="mt-4 font-display text-xl font-bold" style={{ color: "var(--text-hi)" }}>
                Pickup &amp; Delivery
              </h2>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-mid)" }}>
                Order online and choose pickup at our shop or zone-based delivery to your doorstep.
                Track your order status live, from confirmation to your door, right from your account.
              </p>
              <Link href="/track" className="mt-4 inline-block text-sm font-semibold transition-colors hover:text-glow-amber" style={{ color: "var(--glow-amber)" }}>
                Track an order →
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
            <h2 className="font-display text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-hi)" }}>
              What customers say
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {reviews.map((review, i) => (
              <Reveal key={review.id} delay={i * 0.08}>
                <div className="glass h-full rounded-2xl p-6">
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
                Hungry yet?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: "var(--text-mid)" }}>
                Place your order in under a minute and taste why FudFactory is the neighbourhood favourite.
              </p>
              <Link href="/menu" className="btn-glow mt-6 inline-block rounded-full px-8 py-3.5 text-sm font-semibold">
                Order Now →
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
