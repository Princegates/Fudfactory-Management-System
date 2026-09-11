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
    return (
      <span className="inline-block rounded-full bg-cocoa-50 px-4 py-2 text-sm font-semibold text-cocoa-900">
        Currently unavailable
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {sizeOptions.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-cocoa-900">Size</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizeOptions.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setSize(option)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                  size?.label === option.label
                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-brand-200 text-cocoa-900 hover:bg-brand-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <p className="text-sm font-semibold text-cocoa-900">Quantity</p>
        <div className="flex items-center rounded-full border border-brand-200">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-1 text-lg text-brand-600"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="px-3 py-1 text-lg text-brand-600"
          >
            +
          </button>
        </div>
      </div>

      <p className="text-2xl font-bold text-brand-700">{formatCurrency(unitPrice * quantity)}</p>

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
          className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600"
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
          className="rounded-full border border-brand-300 px-6 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
