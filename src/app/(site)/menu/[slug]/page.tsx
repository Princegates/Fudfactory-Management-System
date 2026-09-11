import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { ProductDetailPurchase } from "@/components/site/ProductDetailPurchase";
import { ProductCard } from "@/components/site/ProductCard";

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
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-2xl bg-brand-50">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl">🧁</div>
          )}
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-500">
            {product.category.name}
          </span>
          <h1 className="mt-1 text-3xl font-extrabold text-cocoa-900">{product.name}</h1>
          {product.description && <p className="mt-3 text-cocoa-900/70">{product.description}</p>}
          {product.allergens && (
            <p className="mt-3 text-sm text-cocoa-900/60">
              <span className="font-semibold">Allergens/ingredients:</span> {product.allergens}
            </p>
          )}

          <div className="mt-6">
            <ProductDetailPurchase
              productId={product.id}
              name={product.name}
              basePrice={product.price}
              imageUrl={product.imageUrl}
              sizeOptions={sizeOptions}
              isAvailable={product.isAvailable}
            />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-cocoa-900">You might also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                slug={p.slug}
                name={p.name}
                price={p.price}
                imageUrl={p.imageUrl}
                categoryName={p.category.name}
                isAvailable={p.isAvailable}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
