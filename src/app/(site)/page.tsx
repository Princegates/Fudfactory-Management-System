import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/site/ProductCard";

export default async function HomePage() {
  const [featured, categories, reviews] = await Promise.all([
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
  ]);

  return (
    <div>
      <section className="bg-gradient-to-b from-brand-50 to-[var(--background)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 sm:py-24">
          <span className="rounded-full bg-brand-100 px-4 py-1 text-sm font-semibold text-brand-700">
            @fudfactory.gh
          </span>
          <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-cocoa-900 sm:text-5xl">
            Fresh Bakes, Pastries &amp; Catering — Made Daily
          </h1>
          <p className="max-w-xl text-lg text-cocoa-900/70">
            From meat pies to birthday cakes, order online for pickup or delivery and taste why
            FudFactory is the neighbourhood favourite.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/menu"
              className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
            >
              Order Now
            </Link>
            <Link
              href="/menu"
              className="rounded-full border border-brand-300 px-6 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
            >
              View Menu
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-brand-300 px-6 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-xl font-bold text-cocoa-900">Shop by category</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/menu?category=${category.slug}`}
                className="rounded-xl border border-brand-100 bg-white px-4 py-6 text-center text-sm font-semibold text-cocoa-900 shadow-sm transition hover:border-brand-300 hover:text-brand-600"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-cocoa-900">Featured products</h2>
          <Link href="/menu" className="text-sm font-semibold text-brand-600 hover:underline">
            View all →
          </Link>
        </div>
        {featured.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                slug={product.slug}
                name={product.name}
                price={product.price}
                imageUrl={product.imageUrl}
                categoryName={product.category.name}
                isAvailable={product.isAvailable}
              />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-cocoa-900/60">
            No featured products yet — check back soon or browse the full{" "}
            <Link href="/menu" className="text-brand-600 underline">
              menu
            </Link>
            .
          </p>
        )}
      </section>

      <section className="bg-brand-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold text-cocoa-900">About FudFactory</h2>
            <p className="mt-3 text-cocoa-900/70">
              FudFactory bakes and prepares meat pies, doughnuts, cakes, snacks and full meals fresh
              every day. We serve walk-in customers, online orders and full-scale event catering —
              all made with quality ingredients and a lot of care.
            </p>
            <Link href="/about" className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:underline">
              Learn more about us →
            </Link>
          </div>
          <div>
            <h2 className="text-xl font-bold text-cocoa-900">Pickup &amp; Delivery</h2>
            <p className="mt-3 text-cocoa-900/70">
              Order online and choose pickup at our shop or delivery to your doorstep. Track your
              order status from confirmation to delivery, right from your account.
            </p>
            <Link href="/track" className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:underline">
              Track an order →
            </Link>
          </div>
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-xl font-bold text-cocoa-900">What customers say</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm">
                <div className="text-brand-500">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
                <p className="mt-2 text-sm text-cocoa-900/80">&ldquo;{review.comment}&rdquo;</p>
                <p className="mt-3 text-sm font-semibold text-cocoa-900">{review.customer.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
