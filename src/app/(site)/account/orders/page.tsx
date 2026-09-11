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
    <div className="relative">
      <div className="aurora-bg opacity-30" />
      <div className="relative mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h1 className="font-display text-3xl font-bold" style={{ color: "var(--text-hi)" }}>
          Order <span className="text-gradient">History</span>
        </h1>
        {orders.length > 0 ? (
          <ul className="mt-6 space-y-4">
            {orders.map((order) => (
              <li key={order.id} className="glass rounded-2xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold" style={{ color: "var(--text-hi)" }}>{order.orderNumber}</p>
                    <p className="text-xs" style={{ color: "var(--text-lo)" }}>{formatDate(order.createdAt)}</p>
                  </div>
                  <span className="chip rounded-full px-3 py-1 text-xs font-semibold" data-active="true">
                    {order.status.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="mt-2 text-sm" style={{ color: "var(--text-mid)" }}>
                  {order.items.map((i) => `${i.productName} x${i.quantity}`).join(", ")}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="font-display font-bold text-gradient">{formatCurrency(order.totalAmount)}</p>
                  <Link
                    href={`/order/${order.orderNumber}?phone=${encodeURIComponent(session.phone)}`}
                    className="text-sm font-semibold hover:underline"
                    style={{ color: "var(--glow-cyan)" }}
                  >
                    View details →
                  </Link>
                </div>
                {order.status === "COMPLETED" && order.reviews.length === 0 && (
                  <ReviewForm orderId={order.id} />
                )}
                {order.reviews.length > 0 && (
                  <p className="mt-2 text-xs" style={{ color: "var(--text-lo)" }}>
                    You rated this order {"★".repeat(order.reviews[0].rating)}
                    {"☆".repeat(5 - order.reviews[0].rating)}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-sm" style={{ color: "var(--text-lo)" }}>You haven&apos;t placed any orders yet.</p>
        )}
      </div>
    </div>
  );
}
