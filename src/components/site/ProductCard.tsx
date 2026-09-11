import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { AddToCartButton } from "./AddToCartButton";
import { ProductArt } from "./ProductArt";

export function ProductCard({
  id,
  slug,
  name,
  price,
  imageUrl,
  categoryName,
  isAvailable,
}: {
  id: string;
  slug: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  categoryName?: string;
  isAvailable: boolean;
}) {
  return (
    <div className="glass glow-card group flex flex-col overflow-hidden rounded-2xl">
      <Link href={`/menu/${slug}`} className="block aspect-square overflow-hidden">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          <ProductArt
            name={name}
            category={categoryName}
            className="h-full w-full transition duration-500 group-hover:scale-110"
          />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {categoryName && (
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--glow-amber)" }}>
            {categoryName}
          </span>
        )}
        <Link
          href={`/menu/${slug}`}
          className="font-display font-semibold transition-colors hover:text-glow-amber"
          style={{ color: "var(--text-hi)" }}
        >
          {name}
        </Link>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-display font-bold" style={{ color: "var(--text-hi)" }}>
            {formatCurrency(price)}
          </span>
          {isAvailable ? (
            <AddToCartButton productId={id} name={name} price={price} imageUrl={imageUrl} />
          ) : (
            <span className="chip rounded-full px-3 py-1 text-xs font-semibold">Sold out</span>
          )}
        </div>
      </div>
    </div>
  );
}
