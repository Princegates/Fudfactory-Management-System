import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/session";
import { csvResponse } from "@/lib/csv";

const ALLOWED_ROLES = ["SUPER_ADMIN", "OWNER_MANAGER"];

export async function GET() {
  const session = await getStaffSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return new Response("Not authorized", { status: 403 });
  }

  const orders = await prisma.order.findMany({
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });

  return csvResponse(
    "sales-report.csv",
    orders.map((o) => ({
      OrderNumber: o.orderNumber,
      Date: o.createdAt.toISOString(),
      Channel: o.channel,
      Customer: o.customer?.name ?? "Walk-in",
      Status: o.status,
      Subtotal: o.subtotal,
      Discount: o.discountAmount,
      DeliveryFee: o.deliveryFee,
      Total: o.totalAmount,
      PaymentStatus: o.paymentStatus,
    })),
  );
}
