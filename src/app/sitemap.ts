import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const products = await prisma.product.findMany({ select: { slug: true, updatedAt: true } });

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/menu",
    "/gallery",
    "/promotions",
    "/custom-orders",
    "/contact",
    "/track",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/menu/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
  }));

  return [...staticRoutes, ...productRoutes];
}
