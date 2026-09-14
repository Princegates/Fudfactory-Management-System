import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { OrderStatusUpdater } from "@/components/portal/OrderStatusUpdater";
import { DeleteOrderButton } from "@/components/portal/DeleteOrderButton";

export default async function PortalOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireStaff(["SUPER_ADMIN", "OWNER_MANAGER", "CASHIER", "DELIVERY_OFFICER"]);
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, customer: true, payments: true, delivery: true, cashier: true },
  });
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-cocoa-900">{order.orderNumber}</h1>
        <div className="flex items-center gap-2">
          <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
          {session.role === "SUPER_ADMIN" && (
            <DeleteOrderButton orderId={order.id} orderNumber={order.orderNumber} />
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-brand-100 bg-white p-5">
          <h2 className="font-bold text-cocoa-900">Customer</h2>
          <p className="mt-2 text-sm text-cocoa-900/80">{order.customer?.name ?? "Walk-in"}</p>
          <p className="text-sm text-cocoa-900/60">{order.customer?.phone}</p>
          {order.customer?.email && <p className="text-sm text-cocoa-900/60">{order.customer.email}</p>}
        </div>
        <div className="rounded-2xl border border-brand-100 bg-white p-5">
          <h2 className="font-bold text-cocoa-900">Fulfillment</h2>
          <p className="mt-2 text-sm text-cocoa-900/80">{order.fulfillmentType}</p>
          {order.deliveryAddress && <p className="text-sm text-cocoa-900/60">{order.deliveryAddress}</p>}
          {order.scheduledFor && <p className="text-sm text-cocoa-900/60">Scheduled: {formatDate(order.scheduledFor)}</p>}
          <p className="text-sm text-cocoa-900/60">Placed: {formatDate(order.createdAt)}</p>
          {order.cashier && <p className="text-sm text-cocoa-900/60">Cashier: {order.cashier.name}</p>}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-brand-100 bg-white p-5">
        <h2 className="font-bold text-cocoa-900">Items</h2>
        <table className="mt-3 w-full text-sm">
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
            <div className="flex justify-between text-green-600"><dt>Discount {order.promotionCode ? `(${order.promotionCode})` : ""}</dt><dd>-{formatCurrency(order.discountAmount)}</dd></div>
          )}
          <div className="flex justify-between"><dt>Delivery fee</dt><dd>{formatCurrency(order.deliveryFee)}</dd></div>
          <div className="flex justify-between border-t border-brand-100 pt-2 text-base font-bold text-cocoa-900">
            <dt>Total</dt><dd>{formatCurrency(order.totalAmount)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 rounded-2xl border border-brand-100 bg-white p-5">
        <h2 className="font-bold text-cocoa-900">Payments</h2>
        <ul className="mt-3 space-y-2 text-sm text-cocoa-900/80">
          {order.payments.map((p) => (
            <li key={p.id} className="flex justify-between gap-3">
              <span>
                {p.method} — {p.status}
                {p.gateway !== "NONE" && <span className="text-cocoa-900/50"> ({p.gateway})</span>}
                {p.transactionRef && <span className="ml-2 font-mono text-xs text-cocoa-900/50">Ref: {p.transactionRef}</span>}
              </span>
              <span className="shrink-0">{formatCurrency(p.amount)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
