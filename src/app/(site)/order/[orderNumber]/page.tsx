import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";

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
  searchParams: Promise<{ phone?: string }>;
}) {
  const { orderNumber } = await params;
  const { phone } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, customer: true, delivery: true },
  });

  if (!order || !phone || order.customer?.phone !== phone) {
    notFound();
  }

  const currentIndex = STATUS_STEPS.indexOf(order.status);
  const isTerminalIssue = ["CANCELLED", "REFUNDED", "REJECTED", "PARTIALLY_FULFILLED"].includes(order.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-extrabold text-cocoa-900">Order {order.orderNumber}</h1>
          <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
            {order.status.replace(/_/g, " ")}
          </span>
        </div>
        <p className="mt-1 text-sm text-cocoa-900/60">Placed {formatDate(order.createdAt)}</p>

        {!isTerminalIssue && (
          <ol className="mt-6 flex flex-wrap gap-2 text-xs">
            {STATUS_STEPS.map((step, idx) => (
              <li
                key={step}
                className={`rounded-full px-3 py-1 font-semibold ${
                  idx <= currentIndex ? "bg-brand-500 text-white" : "bg-brand-50 text-cocoa-900/50"
                }`}
              >
                {step.replace(/_/g, " ")}
              </li>
            ))}
          </ol>
        )}

        <table className="mt-6 w-full text-sm">
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-brand-50">
                <td className="py-2">{item.productName} × {item.quantity}</td>
                <td className="py-2 text-right">{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="mt-4 space-y-1 text-sm text-cocoa-900/80">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatCurrency(order.subtotal)}</dd></div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-600"><dt>Discount</dt><dd>-{formatCurrency(order.discountAmount)}</dd></div>
          )}
          <div className="flex justify-between"><dt>Delivery</dt><dd>{formatCurrency(order.deliveryFee)}</dd></div>
          <div className="flex justify-between border-t border-brand-100 pt-2 text-base font-bold text-cocoa-900">
            <dt>Total</dt><dd>{formatCurrency(order.totalAmount)}</dd>
          </div>
        </dl>

        <div className="mt-4 text-sm text-cocoa-900/70">
          <p><span className="font-semibold">Fulfillment:</span> {order.fulfillmentType}</p>
          {order.deliveryAddress && <p><span className="font-semibold">Address:</span> {order.deliveryAddress}</p>}
          <p><span className="font-semibold">Payment status:</span> {order.paymentStatus}</p>
        </div>
      </div>
    </div>
  );
}
