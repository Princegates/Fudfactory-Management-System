import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { AddToCartButton } from "./AddToCartButton";
import { ProductArt } from "./ProductArt";

export function MenuItemRow({
  id,
  slug,
  name,
  description,
  price,
  imageUrl,
  categoryName,
  isAvailable,
}: {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  categoryName?: string;
  isAvailable: boolean;
}) {
  return (
    <div className="glass glow-card flex items-center gap-4 rounded-lg p-3 sm:p-4">
      <Link href={`/menu/${slug}`} className="h-16 w-16 shrink-0 overflow-hidden rounded-md sm:h-20 sm:w-20">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <ProductArt name={name} category={categoryName} className="h-full w-full" iconClassName="h-8 w-8" />
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={`/menu/${slug}`} className="font-display font-semibold transition-colors hover:text-[var(--glow-amber)]" style={{ color: "var(--text-hi)" }}>
          {name}
        </Link>
        {description && (
          <p className="mt-0.5 line-clamp-1 text-sm italic" style={{ color: "var(--text-lo)" }}>
            {description}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="font-display font-bold" style={{ color: "var(--text-hi)" }}>
          {formatCurrency(price)}
        </span>
        {isAvailable ? (
          <AddToCartButton productId={id} name={name} price={price} imageUrl={imageUrl} className="!px-3 !py-1.5 text-xs" />
        ) : (
          <span className="chip rounded-md px-2.5 py-1 text-xs font-semibold">Sold out</span>
        )}
      </div>
    </div>
  );
}
