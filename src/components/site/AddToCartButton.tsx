"use client";

import { useState } from "react";
import { useCart } from "./CartContext";

export function AddToCartButton({
  productId,
  name,
  price,
  imageUrl,
  className = "",
  full = false,
}: {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  className?: string;
  full?: boolean;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        addItem({ productId, name, price, quantity: 1, imageUrl });
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
      className={`${full ? "w-full" : ""} rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 ${className}`}
    >
      {added ? "Added ✓" : "Add to Cart"}
    </button>
  );
}
