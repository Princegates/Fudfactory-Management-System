import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Gallery",
  description: "A look at what we bake and prepare at FudFactory.",
};

export default async function GalleryPage() {
  const products = await prisma.product.findMany({
    where: { imageUrl: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-cocoa-900">Gallery</h1>
      <p className="mt-2 text-cocoa-900/70">A taste of what comes out of our kitchen every day.</p>

      {products.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="aspect-square overflow-hidden rounded-xl bg-brand-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.imageUrl ?? undefined} alt={product.name} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-10 text-center text-cocoa-900/60">
          Photos are on the way — follow @fudfactory.gh on Instagram for the latest bakes.
        </p>
      )}
    </div>
  );
}
