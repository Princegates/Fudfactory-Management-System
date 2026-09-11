import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff(["SUPER_ADMIN", "OWNER_MANAGER", "PRODUCTION_OFFICER"]);
  const { id } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: { product: true, items: { include: { ingredient: true } } },
  });
  if (!recipe) notFound();

  const ingredientCost = recipe.items.reduce((sum, i) => sum + i.quantityPerYield * i.ingredient.costPerUnit, 0);
  const totalCost = ingredientCost + recipe.laborCost + recipe.packagingCost + recipe.overheadCost;
  const costPerUnit = totalCost / recipe.yieldQuantity;
  const grossProfitPerUnit = recipe.product.price - costPerUnit;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-cocoa-900">{recipe.name}</h1>
      <p className="text-sm text-cocoa-900/60">For {recipe.product.name} · Yields {recipe.yieldQuantity}</p>

      <div className="mt-6 rounded-2xl border border-brand-100 bg-white p-5">
        <h2 className="font-bold text-cocoa-900">Ingredients per batch</h2>
        <table className="mt-3 w-full text-sm">
          <tbody>
            {recipe.items.map((item) => (
              <tr key={item.id} className="border-b border-brand-50">
                <td className="py-2">{item.ingredient.name}</td>
                <td className="py-2 text-right">{item.quantityPerYield} {item.ingredient.unit}</td>
                <td className="py-2 text-right text-cocoa-900/60">{formatCurrency(item.quantityPerYield * item.ingredient.costPerUnit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-2xl border border-brand-100 bg-white p-5">
        <h2 className="font-bold text-cocoa-900">Cost breakdown (per batch)</h2>
        <dl className="mt-3 space-y-1 text-sm text-cocoa-900/80">
          <div className="flex justify-between"><dt>Ingredients</dt><dd>{formatCurrency(ingredientCost)}</dd></div>
          <div className="flex justify-between"><dt>Labor</dt><dd>{formatCurrency(recipe.laborCost)}</dd></div>
          <div className="flex justify-between"><dt>Packaging</dt><dd>{formatCurrency(recipe.packagingCost)}</dd></div>
          <div className="flex justify-between"><dt>Overhead</dt><dd>{formatCurrency(recipe.overheadCost)}</dd></div>
          <div className="flex justify-between border-t border-brand-100 pt-2 font-bold text-cocoa-900">
            <dt>Total batch cost</dt><dd>{formatCurrency(totalCost)}</dd>
          </div>
        </dl>

        <dl className="mt-4 space-y-1 border-t border-brand-100 pt-4 text-sm text-cocoa-900/80">
          <div className="flex justify-between"><dt>Estimated cost per unit</dt><dd>{formatCurrency(costPerUnit)}</dd></div>
          <div className="flex justify-between"><dt>Selling price</dt><dd>{formatCurrency(recipe.product.price)}</dd></div>
          <div className="flex justify-between font-bold text-brand-700">
            <dt>Estimated gross profit / unit</dt><dd>{formatCurrency(grossProfitPerUnit)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
