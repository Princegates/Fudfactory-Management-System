import { getStaffSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getStaffSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return new Response("Not authorized", { status: 403 });
  }

  const [
    categories,
    products,
    customers,
    suppliers,
    inventoryItems,
    recipes,
    productionOrders,
    orders,
    payments,
    expenses,
    promotions,
    quotations,
    businessProfile,
  ] = await Promise.all([
    prisma.category.findMany(),
    prisma.product.findMany(),
    // Never export password hashes — select only the fields we want.
    prisma.customer.findMany({ select: { id: true, name: true, phone: true, email: true, address: true, birthday: true, segment: true, loyaltyPoints: true, totalPurchases: true, outstandingBalance: true, createdAt: true, updatedAt: true } }),
    prisma.supplier.findMany(),
    prisma.inventoryItem.findMany(),
    prisma.recipe.findMany({ include: { items: true } }),
    prisma.productionOrder.findMany({ include: { items: true } }),
    prisma.order.findMany({ include: { items: true } }),
    prisma.payment.findMany(),
    prisma.expense.findMany(),
    prisma.promotion.findMany(),
    prisma.quotation.findMany(),
    prisma.businessProfile.findUnique({ where: { id: "default" } }),
  ]);

  const backup = {
    exportedAt: new Date().toISOString(),
    version: 1,
    data: {
      businessProfile,
      categories,
      products,
      customers,
      suppliers,
      inventoryItems,
      recipes,
      productionOrders,
      orders,
      payments,
      expenses,
      promotions,
      quotations,
    },
  };

  return new Response(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="fudfactory-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
