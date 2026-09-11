import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/site/ProductCard";

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
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-cocoa-900">Our Menu</h1>
      <p className="mt-2 text-cocoa-900/70">Fresh cakes, pastries, snacks, meals and drinks — order for pickup or delivery.</p>

      <form className="mt-6 flex flex-wrap gap-3" action="/menu">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search products..."
          className="w-full max-w-xs rounded-full border border-brand-200 px-4 py-2 text-sm focus:border-brand-400 focus:outline-none"
        />
        {category && <input type="hidden" name="category" value={category} />}
        <button className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600">
          Search
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/menu"
          className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
            !category ? "border-brand-500 bg-brand-500 text-white" : "border-brand-200 text-cocoa-900 hover:bg-brand-50"
          }`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/menu?category=${c.slug}`}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
              category === c.slug
                ? "border-brand-500 bg-brand-500 text-white"
                : "border-brand-200 text-cocoa-900 hover:bg-brand-50"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {products.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {products.map((product) => (
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
        <p className="mt-10 text-center text-cocoa-900/60">No products match your search.</p>
      )}
    </div>
  );
}
