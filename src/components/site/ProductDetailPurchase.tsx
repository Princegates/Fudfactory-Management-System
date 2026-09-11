"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import { useCart } from "./CartContext";

type SizeOption = { label: string; priceDelta: number };

export function ProductDetailPurchase({
  productId,
  name,
  basePrice,
  imageUrl,
  sizeOptions,
  isAvailable,
}: {
  productId: string;
  name: string;
  basePrice: number;
  imageUrl?: string | null;
  sizeOptions: SizeOption[];
  isAvailable: boolean;
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<SizeOption | null>(sizeOptions[0] ?? null);
  const [added, setAdded] = useState(false);

  const unitPrice = useMemo(() => basePrice + (size?.priceDelta ?? 0), [basePrice, size]);

  if (!isAvailable) {
    return <span className="chip inline-block rounded-full px-4 py-2 text-sm font-semibold">Currently unavailable</span>;
  }

  return (
    <div className="flex flex-col gap-5">
      {sizeOptions.length > 0 && (
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--text-hi)" }}>Size</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizeOptions.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setSize(option)}
                data-active={size?.label === option.label}
                className="chip rounded-full px-4 py-1.5 text-sm font-medium"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <p className="text-sm font-semibold" style={{ color: "var(--text-hi)" }}>Quantity</p>
        <div className="glass flex items-center rounded-full">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-1.5 text-lg transition-colors hover:text-glow-amber"
            style={{ color: "var(--text-mid)" }}
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-semibold" style={{ color: "var(--text-hi)" }}>{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="px-3 py-1.5 text-lg transition-colors hover:text-glow-amber"
            style={{ color: "var(--text-mid)" }}
          >
            +
          </button>
        </div>
      </div>

      <p className="font-display text-3xl font-bold text-gradient">{formatCurrency(unitPrice * quantity)}</p>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            addItem({
              productId,
              name: size ? `${name} (${size.label})` : name,
              price: unitPrice,
              quantity,
              imageUrl,
              sizeLabel: size?.label,
            });
            setAdded(true);
            setTimeout(() => setAdded(false), 1200);
          }}
          className="btn-glow rounded-md px-6 py-3 text-sm font-semibold"
        >
          {added ? "Added to cart ✓" : "Add to Cart"}
        </button>
        <button
          type="button"
          onClick={() => {
            addItem({
              productId,
              name: size ? `${name} (${size.label})` : name,
              price: unitPrice,
              quantity,
              imageUrl,
              sizeLabel: size?.label,
            });
            router.push("/cart");
          }}
          className="btn-ghost rounded-md px-6 py-3 text-sm font-semibold"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
