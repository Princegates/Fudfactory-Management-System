import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { recordStockMovement } from "./inventory";

type Tx = Prisma.TransactionClient;

export type CartLine = {
  productId: string;
  quantity: number;
};

/**
 * Business rule (SRS #10): "A completed sale must automatically reduce
 * relevant inventory." Applied to both POS sales and online orders at the
 * moment they are placed/completed. Only products with a linked finished-
 * goods InventoryItem are stock-checked; make-to-order products without one
 * are treated as unlimited/untracked.
 *
 * Throws if any tracked item lacks enough stock, so the caller can abort the
 * whole order inside the same transaction.
 */
export async function deductInventoryForSale(
  tx: Tx,
  lines: { productId: string; quantity: number }[],
  reference: string,
  userId?: string | null,
) {
  for (const line of lines) {
    const item = await tx.inventoryItem.findUnique({ where: { productId: line.productId } });
    if (!item) continue; // not stock-tracked (made to order)

    if (item.currentStock < line.quantity) {
      const product = await tx.product.findUnique({ where: { id: line.productId } });
      throw new Error(
        `Insufficient stock for ${product?.name ?? "product"}: ${item.currentStock}${item.unit} available, ${line.quantity}${item.unit} requested.`,
      );
    }

    await recordStockMovement(tx, {
      itemId: item.id,
      type: "SALE_DEDUCTION",
      quantity: -line.quantity,
      reference,
      note: "Sale",
      userId,
    });
  }
}

/**
 * Business rule (SRS #4): "Cancelled orders must not permanently reduce
 * inventory." Reverses any SALE_DEDUCTION movements recorded for an order,
 * unless already reversed.
 */
export async function reverseInventoryForOrder(orderId: string, reference: string, userId?: string | null) {
  await prisma.$transaction(async (tx) => {
    const alreadyReversed = await tx.inventoryTransaction.findFirst({
      where: { reference, type: "SALE_REVERSAL" },
    });
    if (alreadyReversed) return;

    const deductions = await tx.inventoryTransaction.findMany({
      where: { reference, type: "SALE_DEDUCTION" },
    });

    for (const deduction of deductions) {
      await recordStockMovement(tx, {
        itemId: deduction.itemId,
        type: "SALE_REVERSAL",
        quantity: Math.abs(deduction.quantity),
        reference,
        note: `Reversal for order ${orderId}`,
        userId,
      });
    }
  });
}

const POINTS_PER_CURRENCY_UNIT = 1 / 10; // 1 point per GHS 10 spent (configurable in a future Settings module)
const VIP_THRESHOLD = 2000; // lifetime GHS spend to reach VIP segment

/**
 * Awards loyalty points and updates CRM aggregates when an order is
 * completed (SRS #22 loyalty program, #13/#14 CRM & segmentation).
 */
export async function completeOrderCrmEffects(tx: Tx, orderId: string) {
  const order = await tx.order.findUnique({ where: { id: orderId } });
  if (!order || !order.customerId) return;

  const points = Math.floor(order.totalAmount * POINTS_PER_CURRENCY_UNIT);

  const customer = await tx.customer.update({
    where: { id: order.customerId },
    data: {
      totalPurchases: { increment: order.totalAmount },
      loyaltyPoints: { increment: points },
    },
  });

  if (points > 0) {
    await tx.loyaltyTransaction.create({
      data: {
        customerId: order.customerId,
        orderId: order.id,
        points,
        type: "EARN",
        description: `Earned from order ${order.orderNumber}`,
      },
    });
  }

  let segment = customer.segment;
  if (customer.totalPurchases >= VIP_THRESHOLD) {
    segment = "VIP";
  } else if (segment === "NEW") {
    segment = "REGULAR";
  }
  if (segment !== customer.segment) {
    await tx.customer.update({ where: { id: customer.id }, data: { segment } });
  }
}
