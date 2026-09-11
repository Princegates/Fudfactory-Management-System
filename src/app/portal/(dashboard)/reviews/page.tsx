import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { ReviewApprovalToggle } from "@/components/portal/ReviewApprovalToggle";

export default async function ReviewsPage() {
  await requireStaff(["SUPER_ADMIN", "OWNER_MANAGER"]);
  const reviews = await prisma.review.findMany({
    include: { customer: true, order: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-cocoa-900">Reviews</h1>
      <p className="mt-1 text-sm text-cocoa-900/60">Moderate customer reviews before they appear on the homepage.</p>

      <div className="mt-6 space-y-3">
        {reviews.map((review) => (
          <div key={review.id} className="flex items-start justify-between rounded-2xl border border-brand-100 bg-white p-4">
            <div>
              <div className="text-brand-500">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
              <p className="mt-1 text-sm text-cocoa-900/80">{review.comment}</p>
              <p className="mt-1 text-xs text-cocoa-900/50">
                {review.customer.name} · {review.order.orderNumber} · {formatDate(review.createdAt)}
              </p>
            </div>
            <ReviewApprovalToggle reviewId={review.id} isApproved={review.isApproved} />
          </div>
        ))}
        {reviews.length === 0 && <p className="text-sm text-cocoa-900/50">No reviews yet.</p>}
      </div>
    </div>
  );
}
