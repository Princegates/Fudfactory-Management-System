import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/session";
import { csvResponse } from "@/lib/csv";

const ALLOWED_ROLES = ["SUPER_ADMIN", "OWNER_MANAGER"];

export async function GET() {
  const session = await getStaffSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return new Response("Not authorized", { status: 403 });
  }

  const customers = await prisma.customer.findMany({ orderBy: { totalPurchases: "desc" } });

  return csvResponse(
    "customers-report.csv",
    customers.map((c) => ({
      Name: c.name,
      Phone: c.phone,
      Email: c.email ?? "",
      Segment: c.segment,
      TotalPurchases: c.totalPurchases,
      LoyaltyPoints: c.loyaltyPoints,
      JoinedAt: c.createdAt.toISOString(),
    })),
  );
}
