import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PosTerminal } from "@/components/portal/PosTerminal";

export default async function PosPage() {
  await requireStaff(["SUPER_ADMIN", "OWNER_MANAGER", "CASHIER"]);

  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where: { isAvailable: true }, include: { category: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-cocoa-900">Point of Sale</h1>
      <div className="mt-6">
        <PosTerminal
          products={products.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            categoryId: p.categoryId,
            categoryName: p.category.name,
            isAvailable: p.isAvailable,
          }))}
          categories={categories}
        />
      </div>
    </div>
  );
}
