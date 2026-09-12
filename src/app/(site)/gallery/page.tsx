import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductArt } from "@/components/site/ProductArt";
import { Reveal } from "@/components/site/Reveal";
import { getBusinessProfile } from "@/lib/business";

export const metadata: Metadata = {
  title: "Gallery",
  description: "A look at what we bake and prepare at FudFactory.",
};

export default async function GalleryPage() {
  const [products, business] = await Promise.all([
    prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: "desc" }, take: 24 }),
    getBusinessProfile(),
  ]);

  return (
    <div className="relative">
      <div className="aurora-bg opacity-30" />
      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <span className="dept-label">Behind The Kitchen</span>
          <h1 className="mt-3 font-display text-4xl font-bold" style={{ color: "var(--text-hi)" }}>
            The <span className="italic" style={{ color: "var(--glow-amber)" }}>Gallery</span>
          </h1>
          <p className="mt-2 max-w-xl" style={{ color: "var(--text-mid)" }}>
            A taste of what comes out of our kitchen every day. Real photos land here as our team
            uploads them — follow{" "}
            <a
              href={`https://instagram.com/${business.instagramHandle}`}
              target="_blank"
              rel="noreferrer"
              className="font-semibold hover:underline"
              style={{ color: "var(--glow-cyan)" }}
            >
              @{business.instagramHandle}
            </a>{" "}
            for the freshest shots.
          </p>
        </Reveal>

        {products.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {products.map((product, i) => (
              <Reveal key={product.id} delay={(i % 8) * 0.04} className={i % 7 === 0 ? "sm:col-span-2 sm:row-span-2" : ""}>
                <div className="glow-card glass aspect-square overflow-hidden rounded-2xl">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <ProductArt name={product.name} category={product.category.name} className="h-full w-full" iconClassName={i % 7 === 0 ? "text-6xl" : "text-3xl"} />
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="mt-16 text-center" style={{ color: "var(--text-lo)" }}>
            Photos are on the way — follow @{business.instagramHandle} on Instagram for the latest bakes.
          </p>
        )}
      </div>
    </div>
  );
}
