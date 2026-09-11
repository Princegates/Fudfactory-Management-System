import { prisma } from "./prisma";
import { recordStockMovement } from "./inventory";

/**
 * Completes a production order (SRS #11 Production Management):
 * consumes the raw materials specified by each item's recipe, increases the
 * relevant finished-product inventory, and calculates the estimated
 * production cost (SRS #12).
 */
export async function completeProductionOrder(productionOrderId: string, userId?: string | null) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.productionOrder.findUnique({
      where: { id: productionOrderId },
      include: { items: { include: { recipe: { include: { items: true } }, product: true } } },
    });
    if (!order) throw new Error("Production order not found.");
    if (order.status === "COMPLETED") throw new Error("Production order already completed.");

    for (const item of order.items) {
      const produced = item.quantityProduced || item.quantityPlanned;
      let estimatedCost = 0;

      if (item.recipe) {
        const ratio = produced / item.recipe.yieldQuantity;

        for (const recipeItem of item.recipe.items) {
          const requiredQty = recipeItem.quantityPerYield * ratio;
          const ingredient = await tx.inventoryItem.findUnique({ where: { id: recipeItem.ingredientId } });
          if (!ingredient) continue;

          if (ingredient.currentStock < requiredQty) {
            throw new Error(
              `Insufficient ${ingredient.name} to produce ${produced} x ${item.product.name}: need ${requiredQty}${ingredient.unit}, have ${ingredient.currentStock}${ingredient.unit}.`,
            );
          }

          await recordStockMovement(tx, {
            itemId: ingredient.id,
            type: "PRODUCTION_CONSUMPTION",
            quantity: -requiredQty,
            reference: order.code,
            note: `Consumed for ${item.product.name}`,
            userId,
          });

          estimatedCost += requiredQty * ingredient.costPerUnit;
        }

        estimatedCost += (item.recipe.laborCost + item.recipe.packagingCost + item.recipe.overheadCost) * ratio;
      }

      const finishedItem = await tx.inventoryItem.findUnique({ where: { productId: item.productId } });
      if (finishedItem) {
        await recordStockMovement(tx, {
          itemId: finishedItem.id,
          type: "PRODUCTION_OUTPUT",
          quantity: produced,
          reference: order.code,
          note: `Produced ${item.product.name}`,
          userId,
        });
      }

      await tx.productionItem.update({
        where: { id: item.id },
        data: { quantityProduced: produced, estimatedCost },
      });
    }

    return tx.productionOrder.update({
      where: { id: productionOrderId },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
  });
}
