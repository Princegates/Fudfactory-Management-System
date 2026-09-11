import Link from "next/link";
import { requireCustomer } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { ReviewForm } from "@/components/site/ReviewForm";

export default async function AccountOrdersPage() {
  const session = await requireCustomer();
  const orders = await prisma.order.findMany({
    where: { customerId: session.id },
    orderBy: { createdAt: "desc" },
    include: { items: true, reviews: true },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-cocoa-900">Order History</h1>
      {orders.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="rounded-2xl border border-brand-100 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-cocoa-900">{order.orderNumber}</p>
                  <p className="text-xs text-cocoa-900/60">{formatDate(order.createdAt)}</p>
                </div>
                <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                  {order.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="mt-2 text-sm text-cocoa-900/70">
                {order.items.map((i) => `${i.productName} x${i.quantity}`).join(", ")}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <p className="font-bold text-brand-700">{formatCurrency(order.totalAmount)}</p>
                <Link
                  href={`/order/${order.orderNumber}?phone=${encodeURIComponent(session.phone)}`}
                  className="text-sm font-semibold text-brand-600 hover:underline"
                >
                  View details →
                </Link>
              </div>
              {order.status === "COMPLETED" && order.reviews.length === 0 && (
                <ReviewForm orderId={order.id} />
              )}
              {order.reviews.length > 0 && (
                <p className="mt-2 text-xs text-cocoa-900/60">
                  You rated this order {"★".repeat(order.reviews[0].rating)}
                  {"☆".repeat(5 - order.reviews[0].rating)}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-cocoa-900/60">You haven&apos;t placed any orders yet.</p>
      )}
    </div>
  );
}
