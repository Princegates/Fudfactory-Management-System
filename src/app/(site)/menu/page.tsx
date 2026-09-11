import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/site/ProductCard";
import { Reveal } from "@/components/site/Reveal";

export const metadata: Metadata = {
  title: "Menu",
  description: "Browse cakes, pastries, snacks, meals and drinks from FudFactory.",
};

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({
      where: {
        ...(category ? { category: { slug: category } } : {}),
        ...(q
          ? { name: { contains: q } }
          : {}),
      },
      include: { category: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="relative">
      <div className="aurora-bg opacity-40" />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <h1 className="font-display text-4xl font-bold" style={{ color: "var(--text-hi)" }}>
            Our <span className="text-gradient">Menu</span>
          </h1>
          <p className="mt-2" style={{ color: "var(--text-mid)" }}>
            Fresh cakes, pastries, snacks, meals and drinks — order for pickup or delivery.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <form className="mt-8 flex flex-wrap gap-3" action="/menu">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search products..."
              className="glass w-full max-w-xs rounded-full px-4 py-2.5 text-sm outline-none placeholder:text-white/30"
              style={{ color: "var(--text-hi)" }}
            />
            {category && <input type="hidden" name="category" value={category} />}
            <button className="btn-glow rounded-full px-5 py-2.5 text-sm font-semibold">Search</button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/menu" data-active={!category} className="chip rounded-full px-4 py-1.5 text-sm font-medium">
              All
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/menu?category=${c.slug}`}
                data-active={category === c.slug}
                className="chip rounded-full px-4 py-1.5 text-sm font-medium"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </Reveal>

        {products.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {products.map((product, i) => (
              <Reveal key={product.id} delay={(i % 8) * 0.04}>
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
          <p className="mt-16 text-center" style={{ color: "var(--text-lo)" }}>
            No products match your search.
          </p>
        )}
      </div>
    </div>
  );
}
