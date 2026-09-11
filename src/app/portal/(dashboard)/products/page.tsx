import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { QuickCreateForm } from "@/components/portal/QuickCreateForm";
import { ProductRowControls } from "@/components/portal/ProductRowControls";
import { CategoryManager } from "@/components/portal/CategoryManager";

export default async function ProductsPage() {
  await requireStaff(["SUPER_ADMIN", "OWNER_MANAGER"]);

  const [products, categories] = await Promise.all([
    prisma.product.findMany({ include: { category: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-cocoa-900">Menu / Products</h1>
        <div className="flex gap-2">
          <QuickCreateForm action="/api/categories" buttonLabel="+ Category" fields={[{ name: "name", label: "Category name", required: true }]} />
          <QuickCreateForm
            action="/api/products"
            buttonLabel="+ Product"
            fields={[
              { name: "name", label: "Product name", required: true },
              { name: "categoryId", label: "Category", type: "select", required: true, options: categories.map((c) => ({ value: c.id, label: c.name })) },
              { name: "price", label: "Price (GHS)", type: "number", step: "0.01", required: true },
              { name: "imageUrl", label: "Image URL" },
              { name: "description", label: "Description", type: "textarea" },
            ]}
          />
        </div>
      </div>
      <p className="mt-2 text-sm text-cocoa-900/60">
        Changes here reflect immediately on the public website menu — no developer needed.
      </p>

      <div className="mt-4">
        <CategoryManager categories={categories.map((c) => ({ id: c.id, name: c.name, productCount: c._count.products }))} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-100 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-brand-100 text-left text-cocoa-900/50">
              <th className="p-3">Name</th>
              <th className="p-3">Category, Price &amp; Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-brand-50">
                <td className="p-3 font-medium text-cocoa-900">{p.name}</td>
                <td className="p-3">
                  <ProductRowControls
                    productId={p.id}
                    price={p.price}
                    isAvailable={p.isAvailable}
                    isFeatured={p.isFeatured}
                    categoryId={p.categoryId}
                    categories={categories}
                  />
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={2} className="p-6 text-center text-cocoa-900/50">No products yet — add your first one above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
