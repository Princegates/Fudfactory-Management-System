import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { AddToCartButton } from "./AddToCartButton";

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
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/menu/${slug}`} className="block aspect-square overflow-hidden bg-brand-50">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">🧁</div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {categoryName && (
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-500">{categoryName}</span>
        )}
        <Link href={`/menu/${slug}`} className="font-semibold text-cocoa-900 hover:text-brand-600">
          {name}
        </Link>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-bold text-brand-700">{formatCurrency(price)}</span>
          {isAvailable ? (
            <AddToCartButton productId={id} name={name} price={price} imageUrl={imageUrl} />
          ) : (
            <span className="rounded-full bg-cocoa-50 px-3 py-1 text-xs font-semibold text-cocoa-900">
              Sold out
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
