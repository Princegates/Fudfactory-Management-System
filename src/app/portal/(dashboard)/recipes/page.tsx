import Link from "next/link";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { RecipeForm } from "@/components/portal/RecipeForm";

export default async function RecipesPage() {
  await requireStaff(["SUPER_ADMIN", "OWNER_MANAGER", "PRODUCTION_OFFICER"]);

  const [recipes, products, ingredients] = await Promise.all([
    prisma.recipe.findMany({ include: { product: true, items: true }, orderBy: { createdAt: "desc" } }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
    prisma.inventoryItem.findMany({ where: { itemType: "RAW_MATERIAL" }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-cocoa-900">Recipes / BOM</h1>
        <RecipeForm products={products} ingredients={ingredients} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {recipes.map((recipe) => (
          <Link
            key={recipe.id}
            href={`/portal/recipes/${recipe.id}`}
            className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm hover:border-brand-300"
          >
            <p className="font-bold text-cocoa-900">{recipe.name}</p>
            <p className="text-sm text-cocoa-900/60">For {recipe.product.name}</p>
            <p className="mt-2 text-xs text-cocoa-900/50">
              Yields {recipe.yieldQuantity} · {recipe.items.length} ingredient(s)
            </p>
          </Link>
        ))}
        {recipes.length === 0 && <p className="text-sm text-cocoa-900/50">No recipes yet.</p>}
      </div>
    </div>
  );
}
