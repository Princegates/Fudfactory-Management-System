"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/format";

type Product = {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  categoryName: string;
  isAvailable: boolean;
};

type CartLine = { productId: string; name: string; price: number; quantity: number };

export function PosTerminal({
  products,
  categories,
}: {
  products: Product[];
  categories: { id: string; name: string }[];
}) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<{ orderNumber: string; totalAmount: number } | null>(null);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.isAvailable &&
          (!categoryId || p.categoryId === categoryId) &&
          p.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [products, categoryId, search],
  );

  const total = useMemo(() => cart.reduce((sum, l) => sum + l.price * l.quantity, 0), [cart]);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === product.id);
      if (existing) {
        return prev.map((l) => (l.productId === product.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  }

  function updateQty(productId: string, quantity: number) {
    setCart((prev) => prev.map((l) => (l.productId === productId ? { ...l, quantity } : l)).filter((l) => l.quantity > 0));
  }

  async function completeSale() {
    if (cart.length === 0) return;
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/pos/sale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lines: cart.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        paymentMethod,
        customerName,
        customerPhone,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Could not complete sale.");
      return;
    }
    setReceipt({ orderNumber: data.orderNumber, totalAmount: data.totalAmount });
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
  }

  if (receipt) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <p className="text-lg font-bold text-green-700">Sale Complete ✓</p>
        <p className="mt-2 text-sm text-cocoa-900/70">Order {receipt.orderNumber}</p>
        <p className="mt-1 text-2xl font-bold text-cocoa-900">{formatCurrency(receipt.totalAmount)}</p>
        <button
          type="button"
          onClick={() => setReceipt(null)}
          className="mt-6 rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          New Sale
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="flex flex-wrap gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="flex-1 rounded-lg border border-brand-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryId(null)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${!categoryId ? "border-brand-500 bg-brand-500 text-white" : "border-brand-200"}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${categoryId === c.id ? "border-brand-500 bg-brand-500 text-white" : "border-brand-200"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="rounded-xl border border-brand-100 bg-white p-3 text-left shadow-sm hover:border-brand-300"
            >
              <p className="text-sm font-semibold text-cocoa-900">{product.name}</p>
              <p className="text-xs text-brand-600">{formatCurrency(product.price)}</p>
            </button>
          ))}
          {filtered.length === 0 && <p className="col-span-full text-sm text-cocoa-900/50">No products found.</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-cocoa-900">Current Sale</h2>
        <ul className="mt-3 divide-y divide-brand-50">
          {cart.map((line) => (
            <li key={line.productId} className="flex items-center justify-between py-2 text-sm">
              <div>
                <p className="font-medium text-cocoa-900">{line.name}</p>
                <p className="text-xs text-cocoa-900/50">{formatCurrency(line.price)} each</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-full border border-brand-200">
                  <button onClick={() => updateQty(line.productId, line.quantity - 1)} className="px-2 text-brand-600">−</button>
                  <span className="w-6 text-center">{line.quantity}</span>
                  <button onClick={() => updateQty(line.productId, line.quantity + 1)} className="px-2 text-brand-600">+</button>
                </div>
              </div>
            </li>
          ))}
          {cart.length === 0 && <p className="py-4 text-sm text-cocoa-900/50">No items yet — tap products to add.</p>}
        </ul>

        <div className="mt-4 flex justify-between font-bold text-cocoa-900">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>

        <div className="mt-4 space-y-2">
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Customer name (optional)"
            className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm"
          />
          <input
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Customer phone (optional, for loyalty)"
            className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm"
          />
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm"
          >
            <option value="CASH">Cash</option>
            <option value="MOBILE_MONEY">Mobile Money</option>
            <option value="CARD">Card</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
          </select>
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <button
          type="button"
          onClick={completeSale}
          disabled={cart.length === 0 || submitting}
          className="mt-4 w-full rounded-full bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {submitting ? "Processing..." : `Complete Sale · ${formatCurrency(total)}`}
        </button>
      </div>
    </div>
  );
}
