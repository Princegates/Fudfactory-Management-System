import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MenuItemRow } from "@/components/site/MenuItemRow";
import { CATEGORY_ICON } from "@/components/site/ProductArt";
import { Icon } from "@/components/site/Icon";
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

  const grouped = categories
    .map((c) => ({ category: c, items: products.filter((p) => p.categoryId === c.id) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="relative">
      <div className="aurora-bg opacity-40" />
      <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl font-bold" style={{ color: "var(--text-hi)" }}>
                Our <span className="italic" style={{ color: "var(--glow-amber)" }}>Menu</span>
              </h1>
              <p className="mt-2" style={{ color: "var(--text-mid)" }}>
                Fresh cakes, pastries, snacks, meals and drinks — order for pickup or delivery.
              </p>
            </div>
            <a
              href="/api/menu/pdf"
              download
              className="btn-ghost inline-flex shrink-0 items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold"
            >
              <Icon name="download" className="h-4 w-4" />
              Download Menu (PDF)
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <form className="mt-8 flex flex-wrap gap-3" action="/menu">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search products..."
              className="input-dark w-full max-w-xs rounded-md px-4 py-2.5 text-sm outline-none"
            />
            {category && <input type="hidden" name="category" value={category} />}
            <button className="btn-glow rounded-md px-5 py-2.5 text-sm font-semibold">Search</button>
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

        {grouped.length > 0 ? (
          <div className="mt-12 space-y-12">
            {grouped.map((group, gi) => (
              <Reveal key={group.category.id} delay={gi * 0.05}>
                <section>
                  <div className="flex items-center gap-3 border-b pb-3" style={{ borderColor: "var(--ink-border)" }}>
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-md"
                      style={{ background: "color-mix(in srgb, var(--glow-amber) 14%, transparent)", color: "var(--glow-amber)" }}
                    >
                      <Icon name={CATEGORY_ICON[group.category.name] ?? "sparkle"} className="h-5 w-5" />
                    </span>
                    <h2 className="font-display text-2xl font-bold" style={{ color: "var(--text-hi)" }}>
                      {group.category.name}
                    </h2>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {group.items.map((product) => (
                      <MenuItemRow
                        key={product.id}
                        id={product.id}
                        slug={product.slug}
                        name={product.name}
                        description={product.description}
                        price={product.price}
                        imageUrl={product.imageUrl}
                        categoryName={product.category.name}
                        isAvailable={product.isAvailable}
                      />
                    ))}
                  </div>
                </section>
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
