import { Prisma, StockMovementType } from "@prisma/client";
import { prisma } from "./prisma";

type Tx = Prisma.TransactionClient;

/**
 * Records a stock movement and applies its delta to the item's running
 * balance in one atomic step. `quantity` is signed: positive increases
 * stock, negative decreases it.
 */
export async function recordStockMovement(
  tx: Tx,
  params: {
    itemId: string;
    type: StockMovementType;
    quantity: number;
    reference?: string | null;
    note?: string | null;
    userId?: string | null;
  },
) {
  await tx.inventoryTransaction.create({
    data: {
      itemId: params.itemId,
      type: params.type,
      quantity: params.quantity,
      reference: params.reference ?? null,
      note: params.note ?? null,
      userId: params.userId ?? null,
    },
  });

  await tx.inventoryItem.update({
    where: { id: params.itemId },
    data: { currentStock: { increment: params.quantity } },
  });
}

export async function getLowStockItems() {
  const items = await prisma.inventoryItem.findMany({
    include: { supplier: true, product: true },
    orderBy: { name: "asc" },
  });
  return items.filter((item) => item.currentStock <= item.minStock);
}
