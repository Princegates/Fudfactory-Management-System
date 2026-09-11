"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/site/CartContext";
import { ProductArt } from "@/components/site/ProductArt";
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
  const [gateways, setGateways] = useState({ paystack: false, hubtel: false });
  const [manualMomo, setManualMomo] = useState<{ number: string; network: string; instructions: string } | null>(null);
  const [transactionRef, setTransactionRef] = useState("");

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
    fetch("/api/payments/available")
      .then((r) => r.json())
      .then((data) => {
        setGateways({ paystack: Boolean(data.paystack), hubtel: Boolean(data.hubtel) });
        setManualMomo(data.manualMomo ?? null);
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
    if (paymentMethod === "MOBILE_MONEY" && !transactionRef.trim()) {
      setError("Enter the Mobile Money transaction ID from your payment SMS.");
      return;
    }

    const gatewayProvider = paymentMethod === "PAYSTACK" || paymentMethod === "HUBTEL" ? paymentMethod : undefined;

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
        paymentMethod: gatewayProvider ? "CARD" : paymentMethod,
        gatewayProvider,
        transactionRef: paymentMethod === "MOBILE_MONEY" ? transactionRef.trim() : undefined,
        promotionCode: promoResult ? promoCode : undefined,
        lines: items.map((i) => ({ productId: i.productId, quantity: i.quantity, sizeLabel: i.sizeLabel })),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setSubmitting(false);
      setError(data.error ?? "Could not place order.");
      return;
    }
    clear();

    if (!gatewayProvider) {
      setSubmitting(false);
      router.push(`/order/${data.orderNumber}?phone=${encodeURIComponent(phone)}`);
      return;
    }

    // Kick off the hosted checkout and send the browser there.
    const endpoint = gatewayProvider === "PAYSTACK" ? "/api/payments/paystack/initialize" : "/api/payments/hubtel/checkout";
    const gwRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber: data.orderNumber, phone }),
    });
    const gwData = await gwRes.json();
    setSubmitting(false);
    if (!gwRes.ok) {
      setError(`${gwData.error ?? "Could not start payment."} You can retry from your order page.`);
      router.push(`/order/${data.orderNumber}?phone=${encodeURIComponent(phone)}`);
      return;
    }
    window.location.href = gwData.authorizationUrl ?? gwData.checkoutUrl;
  }

  if (items.length === 0) {
    return (
      <div className="relative">
        <div className="aurora-bg opacity-30" />
        <div className="relative mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
          <h1 className="font-display text-2xl font-bold" style={{ color: "var(--text-hi)" }}>
            Your cart is empty
          </h1>
          <p className="mt-2" style={{ color: "var(--text-mid)" }}>Add something delicious from the menu to get started.</p>
          <Link href="/menu" className="btn-glow mt-6 inline-block rounded-full px-6 py-3 text-sm font-semibold">
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="aurora-bg opacity-30" />
      <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-4xl font-bold" style={{ color: "var(--text-hi)" }}>
          Your <span className="text-gradient">Cart</span>
        </h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ul className="glass divide-y rounded-2xl" style={{ borderColor: "var(--ink-border)" }}>
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.sizeLabel ?? ""}`}
                  className="flex items-center gap-4 p-4"
                  style={{ borderColor: "var(--ink-border)" }}
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <ProductArt name={item.name} className="h-full w-full" iconClassName="text-2xl" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold" style={{ color: "var(--text-hi)" }}>{item.name}</p>
                    <p className="text-sm" style={{ color: "var(--text-lo)" }}>{formatCurrency(item.price)} each</p>
                  </div>
                  <div className="glass flex items-center rounded-full">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="px-3 py-1 transition-colors hover:text-glow-amber"
                      style={{ color: "var(--text-mid)" }}
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold" style={{ color: "var(--text-hi)" }}>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="px-3 py-1 transition-colors hover:text-glow-amber"
                      style={{ color: "var(--text-mid)" }}
                    >
                      +
                    </button>
                  </div>
                  <p className="w-24 text-right font-semibold" style={{ color: "var(--text-hi)" }}>
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="text-sm text-red-400 hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            <div className="glass mt-8 rounded-2xl p-6">
              <h2 className="font-display font-bold" style={{ color: "var(--text-hi)" }}>Your details</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="input-dark rounded-lg px-3 py-2 text-sm" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="input-dark rounded-lg px-3 py-2 text-sm" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" className="input-dark rounded-lg px-3 py-2 text-sm sm:col-span-2" />
              </div>

              <h2 className="mt-6 font-display font-bold" style={{ color: "var(--text-hi)" }}>Fulfillment</h2>
              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setFulfillmentType("PICKUP")}
                  data-active={fulfillmentType === "PICKUP"}
                  className="chip rounded-full px-4 py-1.5 text-sm font-medium"
                >
                  Pickup
                </button>
                <button
                  type="button"
                  onClick={() => setFulfillmentType("DELIVERY")}
                  data-active={fulfillmentType === "DELIVERY"}
                  className="chip rounded-full px-4 py-1.5 text-sm font-medium"
                >
                  Delivery (+{formatCurrency(DELIVERY_FEE)})
                </button>
              </div>
              {fulfillmentType === "DELIVERY" && (
                <input
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Delivery address"
                  className="input-dark mt-3 w-full rounded-lg px-3 py-2 text-sm"
                />
              )}
              <label className="mt-4 block text-sm font-medium" style={{ color: "var(--text-hi)" }}>
                Preferred date/time (optional)
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="input-dark mt-1 w-full rounded-lg px-3 py-2 text-sm"
                />
              </label>

              <h2 className="mt-6 font-display font-bold" style={{ color: "var(--text-hi)" }}>Payment method</h2>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="input-dark mt-2 w-full rounded-lg px-3 py-2 text-sm"
              >
                <option value="CASH" className="bg-ink-900">Cash on pickup/delivery</option>
                <option value="MOBILE_MONEY" className="bg-ink-900">Mobile Money — send to our number</option>
                <option value="CARD" className="bg-ink-900">Card (pay on delivery)</option>
                <option value="BANK_TRANSFER" className="bg-ink-900">Bank Transfer</option>
                {gateways.paystack && <option value="PAYSTACK" className="bg-ink-900">💳 Pay now with Paystack (card / mobile money)</option>}
                {gateways.hubtel && <option value="HUBTEL" className="bg-ink-900">📲 Pay now with Hubtel (card / mobile money)</option>}
              </select>

              {paymentMethod === "MOBILE_MONEY" && (
                <div className="glass mt-3 rounded-xl p-4">
                  {manualMomo ? (
                    <>
                      <p className="text-sm" style={{ color: "var(--text-mid)" }}>{manualMomo.instructions}</p>
                      <p className="mt-2 font-display text-lg font-bold text-gradient">{manualMomo.number}</p>
                      <p className="text-xs" style={{ color: "var(--text-lo)" }}>{manualMomo.network}</p>
                    </>
                  ) : (
                    <p className="text-sm" style={{ color: "var(--text-mid)" }}>
                      Send the order total to our Mobile Money number (see the Contact page), then enter the
                      transaction ID from your confirmation SMS below.
                    </p>
                  )}
                  <input
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="Transaction ID / reference"
                    className="input-dark mt-3 w-full rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="glass-strong h-fit rounded-2xl p-6">
            <h2 className="font-display font-bold" style={{ color: "var(--text-hi)" }}>Order Summary</h2>
            <div className="mt-4 flex gap-2">
              <input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Promo code"
                className="input-dark flex-1 rounded-lg px-3 py-2 text-sm"
              />
              <button type="button" onClick={applyPromo} className="btn-ghost rounded-lg px-3 py-2 text-sm font-semibold">
                Apply
              </button>
            </div>
            {promoError && <p className="mt-1 text-xs text-red-400">{promoError}</p>}
            {promoResult && <p className="mt-1 text-xs text-green-400">{promoResult.name} applied!</p>}

            <dl className="mt-4 space-y-2 text-sm" style={{ color: "var(--text-mid)" }}>
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatCurrency(subtotal)}</dd></div>
              {discount > 0 && (
                <div className="flex justify-between text-green-400"><dt>Discount</dt><dd>-{formatCurrency(discount)}</dd></div>
              )}
              <div className="flex justify-between"><dt>Delivery</dt><dd>{formatCurrency(deliveryFee)}</dd></div>
              <div className="flex justify-between border-t pt-2 text-base font-bold" style={{ borderColor: "var(--ink-border)", color: "var(--text-hi)" }}>
                <dt>Total</dt><dd>{formatCurrency(total)}</dd>
              </div>
            </dl>

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

            <button
              type="button"
              onClick={submitOrder}
              disabled={submitting}
              className="btn-glow mt-6 w-full rounded-full py-3 text-sm font-semibold disabled:opacity-60"
            >
              {submitting ? "Placing order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
