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
      className={`btn-glow ${full ? "w-full" : ""} rounded-full px-4 py-2 text-sm font-semibold ${className}`}
    >
      {added ? "Added ✓" : "Add to Cart"}
    </button>
  );
}
