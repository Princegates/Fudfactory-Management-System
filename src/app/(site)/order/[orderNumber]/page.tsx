import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { RetryPaymentButton } from "@/components/site/RetryPaymentButton";

const STATUS_STEPS = [
  "NEW",
  "CONFIRMED",
  "PROCESSING",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "COMPLETED",
];

export default async function OrderTrackingPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ phone?: string; paymentFailed?: string }>;
}) {
  const { orderNumber } = await params;
  const { phone, paymentFailed } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, customer: true, delivery: true, payments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  if (!order || !phone || order.customer?.phone !== phone) {
    notFound();
  }

  const currentIndex = STATUS_STEPS.indexOf(order.status);
  const isTerminalIssue = ["CANCELLED", "REFUNDED", "REJECTED", "PARTIALLY_FULFILLED"].includes(order.status);
  const latestPayment = order.payments[0];
  const retryGateway =
    order.channel === "ONLINE" && order.paymentStatus !== "SUCCESSFUL" && latestPayment
      ? latestPayment.gateway === "PAYSTACK" || latestPayment.gateway === "HUBTEL"
        ? latestPayment.gateway
        : null
      : null;

  return (
    <div className="relative">
      <div className="aurora-bg opacity-30" />
      <div className="relative mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <div className="glass-strong rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="font-display text-2xl font-bold" style={{ color: "var(--text-hi)" }}>
              Order {order.orderNumber}
            </h1>
            <span className="chip rounded-full px-3 py-1 text-xs font-semibold" data-active="true">
              {order.status.replace(/_/g, " ")}
            </span>
          </div>
          <p className="mt-1 text-sm" style={{ color: "var(--text-lo)" }}>Placed {formatDate(order.createdAt)}</p>

          {paymentFailed && (
            <div className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
              Your payment didn&apos;t go through. Your order is saved — try again below.
            </div>
          )}

          {!isTerminalIssue && (
            <ol className="mt-6 flex flex-wrap gap-2 text-xs">
              {STATUS_STEPS.map((step, idx) => (
                <li
                  key={step}
                  className="rounded-full px-3 py-1 font-semibold"
                  style={
                    idx <= currentIndex
                      ? { background: "linear-gradient(135deg, var(--glow-amber), var(--glow-amber-strong))", color: "#1a0f04" }
                      : { background: "rgba(255,255,255,0.04)", color: "var(--text-lo)" }
                  }
                >
                  {step.replace(/_/g, " ")}
                </li>
              ))}
            </ol>
          )}

          <table className="mt-6 w-full text-sm">
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b" style={{ borderColor: "var(--ink-border)", color: "var(--text-mid)" }}>
                  <td className="py-2">{item.productName} × {item.quantity}</td>
                  <td className="py-2 text-right">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <dl className="mt-4 space-y-1 text-sm" style={{ color: "var(--text-mid)" }}>
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatCurrency(order.subtotal)}</dd></div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-400"><dt>Discount</dt><dd>-{formatCurrency(order.discountAmount)}</dd></div>
            )}
            <div className="flex justify-between"><dt>Delivery</dt><dd>{formatCurrency(order.deliveryFee)}</dd></div>
            <div className="flex justify-between border-t pt-2 text-base font-bold" style={{ borderColor: "var(--ink-border)", color: "var(--text-hi)" }}>
              <dt>Total</dt><dd>{formatCurrency(order.totalAmount)}</dd>
            </div>
          </dl>

          <div className="mt-4 text-sm" style={{ color: "var(--text-mid)" }}>
            <p><span className="font-semibold" style={{ color: "var(--text-hi)" }}>Fulfillment:</span> {order.fulfillmentType}</p>
            {order.deliveryAddress && <p><span className="font-semibold" style={{ color: "var(--text-hi)" }}>Address:</span> {order.deliveryAddress}</p>}
            <p><span className="font-semibold" style={{ color: "var(--text-hi)" }}>Payment status:</span> {order.paymentStatus}</p>
          </div>

          {retryGateway && (
            <RetryPaymentButton orderNumber={order.orderNumber} phone={phone as string} gateway={retryGateway} />
          )}
        </div>
      </div>
    </div>
  );
}
