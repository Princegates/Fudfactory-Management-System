import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { ProductDetailPurchase } from "@/components/site/ProductDetailPurchase";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductArt } from "@/components/site/ProductArt";
import { Reveal } from "@/components/site/Reveal";

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description ?? `${product.name} — ${formatCurrency(product.price)} at FudFactory.`,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const sizeOptions = product.sizeOptions ? JSON.parse(product.sizeOptions) : [];
  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, isAvailable: true },
    include: { category: true },
    take: 4,
  });

  return (
    <div className="relative">
      <div className="aurora-bg opacity-30" />
      <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2">
          <Reveal>
            <div className="glow-card glass aspect-square overflow-hidden rounded-3xl">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <ProductArt name={product.name} category={product.category.name} className="h-full w-full" iconClassName="text-8xl" />
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--glow-amber)" }}>
              {product.category.name}
            </span>
            <h1 className="mt-2 font-display text-4xl font-bold" style={{ color: "var(--text-hi)" }}>
              {product.name}
            </h1>
            {product.description && (
              <p className="mt-3 leading-relaxed" style={{ color: "var(--text-mid)" }}>
                {product.description}
              </p>
            )}
            {product.allergens && (
              <p className="mt-3 text-sm" style={{ color: "var(--text-lo)" }}>
                <span className="font-semibold" style={{ color: "var(--text-mid)" }}>Allergens/ingredients:</span> {product.allergens}
              </p>
            )}

            <div className="mt-8">
              <ProductDetailPurchase
                productId={product.id}
                name={product.name}
                basePrice={product.price}
                imageUrl={product.imageUrl}
                sizeOptions={sizeOptions}
                isAvailable={product.isAvailable}
              />
            </div>
          </Reveal>
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <Reveal>
              <h2 className="font-display text-2xl font-bold" style={{ color: "var(--text-hi)" }}>
                You might also like
              </h2>
            </Reveal>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {related.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.06}>
                  <ProductCard
                    id={p.id}
                    slug={p.slug}
                    name={p.name}
                    price={p.price}
                    imageUrl={p.imageUrl}
                    categoryName={p.category.name}
                    isAvailable={p.isAvailable}
                  />
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
