"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/site/CartContext";
import { formatCurrency } from "@/lib/format";

const DELIVERY_FEE = 15;

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, clear } = useCart();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [fulfillmentType, setFulfillmentType] = useState<"PICKUP" | "DELIVERY">("PICKUP");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] = useState<{ discount: number; name: string } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/customer/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.customer) {
          setName(data.customer.name);
          setPhone(data.customer.phone);
          setEmail(data.customer.email ?? "");
          setDeliveryAddress(data.customer.address ?? "");
        }
      })
      .catch(() => {});
  }, []);

  const deliveryFee = fulfillmentType === "DELIVERY" ? DELIVERY_FEE : 0;
  const discount = promoResult?.discount ?? 0;
  const total = Math.max(0, subtotal - discount + deliveryFee);

  async function applyPromo() {
    setPromoError(null);
    setPromoResult(null);
    const res = await fetch("/api/promotions/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: promoCode, subtotal }),
    });
    const data = await res.json();
    if (!res.ok) {
      setPromoError(data.error ?? "Invalid code.");
      return;
    }
    setPromoResult(data);
  }

  async function submitOrder() {
    setError(null);
    if (!name.trim() || !phone.trim()) {
      setError("Please enter your name and phone number.");
      return;
    }
    if (fulfillmentType === "DELIVERY" && !deliveryAddress.trim()) {
      setError("Please enter a delivery address.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        email: email || undefined,
        fulfillmentType,
        deliveryAddress: fulfillmentType === "DELIVERY" ? deliveryAddress : undefined,
        scheduledFor: scheduledFor || undefined,
        paymentMethod,
        promotionCode: promoResult ? promoCode : undefined,
        lines: items.map((i) => ({ productId: i.productId, quantity: i.quantity, sizeLabel: i.sizeLabel })),
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Could not place order.");
      return;
    }
    clear();
    router.push(`/order/${data.orderNumber}?phone=${encodeURIComponent(phone)}`);
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-cocoa-900">Your cart is empty</h1>
        <p className="mt-2 text-cocoa-900/60">Add something delicious from the menu to get started.</p>
        <Link href="/menu" className="mt-6 inline-block rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600">
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-cocoa-900">Your Cart</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ul className="divide-y divide-brand-100 rounded-2xl border border-brand-100 bg-white">
            {items.map((item) => (
              <li key={`${item.productId}-${item.sizeLabel ?? ""}`} className="flex items-center gap-4 p-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-50">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl">🧁</div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-cocoa-900">{item.name}</p>
                  <p className="text-sm text-cocoa-900/60">{formatCurrency(item.price)} each</p>
                </div>
                <div className="flex items-center rounded-full border border-brand-200">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="px-3 py-1 text-brand-600"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="px-3 py-1 text-brand-600"
                  >
                    +
                  </button>
                </div>
                <p className="w-24 text-right font-semibold text-cocoa-900">
                  {formatCurrency(item.price * item.quantity)}
                </p>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-2xl border border-brand-100 bg-white p-6">
            <h2 className="font-bold text-cocoa-900">Your details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="rounded-lg border border-brand-200 px-3 py-2 text-sm" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="rounded-lg border border-brand-200 px-3 py-2 text-sm" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" className="rounded-lg border border-brand-200 px-3 py-2 text-sm sm:col-span-2" />
            </div>

            <h2 className="mt-6 font-bold text-cocoa-900">Fulfillment</h2>
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={() => setFulfillmentType("PICKUP")}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium ${fulfillmentType === "PICKUP" ? "border-brand-500 bg-brand-500 text-white" : "border-brand-200 text-cocoa-900"}`}
              >
                Pickup
              </button>
              <button
                type="button"
                onClick={() => setFulfillmentType("DELIVERY")}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium ${fulfillmentType === "DELIVERY" ? "border-brand-500 bg-brand-500 text-white" : "border-brand-200 text-cocoa-900"}`}
              >
                Delivery (+{formatCurrency(DELIVERY_FEE)})
              </button>
            </div>
            {fulfillmentType === "DELIVERY" && (
              <input
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Delivery address"
                className="mt-3 w-full rounded-lg border border-brand-200 px-3 py-2 text-sm"
              />
            )}
            <label className="mt-4 block text-sm font-medium text-cocoa-900">
              Preferred date/time (optional)
              <input
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                className="mt-1 w-full rounded-lg border border-brand-200 px-3 py-2 text-sm"
              />
            </label>

            <h2 className="mt-6 font-bold text-cocoa-900">Payment method</h2>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-2 w-full rounded-lg border border-brand-200 px-3 py-2 text-sm"
            >
              <option value="CASH">Cash on pickup/delivery</option>
              <option value="MOBILE_MONEY">Mobile Money</option>
              <option value="CARD">Card</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="ONLINE">Online Payment</option>
            </select>
          </div>
        </div>

        <div className="h-fit rounded-2xl border border-brand-100 bg-white p-6">
          <h2 className="font-bold text-cocoa-900">Order Summary</h2>
          <div className="mt-4 flex gap-2">
            <input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Promo code"
              className="flex-1 rounded-lg border border-brand-200 px-3 py-2 text-sm"
            />
            <button type="button" onClick={applyPromo} className="rounded-lg border border-brand-300 px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">
              Apply
            </button>
          </div>
          {promoError && <p className="mt-1 text-xs text-red-600">{promoError}</p>}
          {promoResult && <p className="mt-1 text-xs text-green-600">{promoResult.name} applied!</p>}

          <dl className="mt-4 space-y-2 text-sm text-cocoa-900/80">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatCurrency(subtotal)}</dd></div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600"><dt>Discount</dt><dd>-{formatCurrency(discount)}</dd></div>
            )}
            <div className="flex justify-between"><dt>Delivery</dt><dd>{formatCurrency(deliveryFee)}</dd></div>
            <div className="flex justify-between border-t border-brand-100 pt-2 text-base font-bold text-cocoa-900">
              <dt>Total</dt><dd>{formatCurrency(total)}</dd>
            </div>
          </dl>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <button
            type="button"
            onClick={submitOrder}
            disabled={submitting}
            className="mt-6 w-full rounded-full bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {submitting ? "Placing order..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
