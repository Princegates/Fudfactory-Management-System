import { OrderChannel, FulfillmentType, PaymentMethod, PaymentGateway, Order } from "@prisma/client";
import { prisma } from "./prisma";
import { deductInventoryForSale, completeOrderCrmEffects } from "./sales";
import { generateOrderNumber } from "./format";

export type OrderLineInput = {
  productId: string;
  quantity: number;
  sizeLabel?: string;
};

export type CreateOrderInput = {
  channel: OrderChannel;
  lines: OrderLineInput[];
  fulfillmentType: FulfillmentType;
  deliveryAddress?: string;
  scheduledFor?: Date;
  paymentMethod: PaymentMethod;
  promotionCode?: string;
  notes?: string;
  cashierId?: string; // set for POS sales
  // Optional for anonymous POS walk-in sales; required for online orders
  // (enforced by the API route) so delivery/tracking/CRM has somewhere to go.
  customer?: { id?: string; name: string; phone: string; email?: string };
  // When set, payment is processed by a gateway (Paystack/Hubtel) rather
  // than recorded instantly: the order is created with paymentStatus
  // PENDING regardless of channel, and completion is deferred until the
  // gateway confirms via webhook/callback (see finalizeGatewayPayment).
  gateway?: Extract<PaymentGateway, "PAYSTACK" | "HUBTEL">;
  // Customer-supplied reference for a direct/manual payment (e.g. a Mobile
  // Money transaction ID for a transfer sent outside any gateway, or a bank
  // transfer reference). Recorded for staff to verify before confirming.
  transactionRef?: string;
};

const DEFAULT_DELIVERY_FEE = 15;

function resolveUnitPrice(basePrice: number, sizeOptionsJson: string | null, sizeLabel?: string) {
  if (!sizeLabel || !sizeOptionsJson) return basePrice;
  try {
    const options: { label: string; priceDelta: number }[] = JSON.parse(sizeOptionsJson);
    const match = options.find((o) => o.label === sizeLabel);
    return match ? basePrice + match.priceDelta : basePrice;
  } catch {
    return basePrice;
  }
}

export async function createOrder(input: CreateOrderInput) {
  if (input.lines.length === 0) throw new Error("Cannot place an empty order.");

  return prisma.$transaction(async (tx) => {
    // Resolve or create the customer profile (guest checkout still creates a
    // CRM record per SRS #13, keyed by phone number). POS sales may omit a
    // customer entirely for anonymous walk-in purchases.
    let customerId = input.customer?.id;
    if (!customerId && input.customer) {
      const existing = await tx.customer.findUnique({ where: { phone: input.customer.phone } });
      if (existing) {
        customerId = existing.id;
      } else {
        const created = await tx.customer.create({
          data: { name: input.customer.name, phone: input.customer.phone, email: input.customer.email },
        });
        customerId = created.id;
      }
    }

    // Price every line server-side — never trust client-submitted prices.
    let subtotal = 0;
    const resolvedLines: {
      productId: string;
      productName: string;
      unitPrice: number;
      quantity: number;
      subtotal: number;
      addOns: string | null;
    }[] = [];

    for (const line of input.lines) {
      const product = await tx.product.findUnique({ where: { id: line.productId } });
      if (!product || !product.isAvailable) {
        throw new Error(`${product?.name ?? "Item"} is not available for ordering.`);
      }
      const unitPrice = resolveUnitPrice(product.price, product.sizeOptions, line.sizeLabel);
      const lineSubtotal = unitPrice * line.quantity;
      subtotal += lineSubtotal;
      resolvedLines.push({
        productId: product.id,
        productName: line.sizeLabel ? `${product.name} (${line.sizeLabel})` : product.name,
        unitPrice,
        quantity: line.quantity,
        subtotal: lineSubtotal,
        addOns: line.sizeLabel ? JSON.stringify({ size: line.sizeLabel }) : null,
      });
    }

    // Apply a promotion code, if any (percentage/fixed-amount handled
    // automatically; BOGO/combo offers are recorded for manual reconciliation).
    let discountAmount = 0;
    if (input.promotionCode) {
      const promo = await tx.promotion.findUnique({ where: { code: input.promotionCode } });
      const now = new Date();
      const valid =
        promo &&
        promo.isActive &&
        promo.startDate <= now &&
        (!promo.endDate || promo.endDate >= now) &&
        (!promo.usageLimit || promo.usedCount < promo.usageLimit) &&
        (!promo.minSpend || subtotal >= promo.minSpend);

      if (!valid) {
        throw new Error("The promotion code is invalid or no longer applicable.");
      }
      if (promo.type === "PERCENTAGE") discountAmount = subtotal * (promo.value / 100);
      if (promo.type === "FIXED_AMOUNT") discountAmount = Math.min(promo.value, subtotal);
      await tx.promotion.update({ where: { id: promo.id }, data: { usedCount: { increment: 1 } } });
    }

    const deliveryFee = input.fulfillmentType === "DELIVERY" ? DEFAULT_DELIVERY_FEE : 0;
    const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee);

    const usesGateway = Boolean(input.gateway);
    // POS: the cashier is physically present and confirms payment on the
    // spot, so a manually-recorded method is instantly successful. Online:
    // every manual method (cash on delivery, direct MoMo transfer, bank
    // transfer) needs a human to actually check the money arrived, so it
    // stays PENDING until staff confirms it on the Payments screen — a
    // gateway (Paystack/Hubtel) is the only way to confirm automatically.
    const isImmediatePayment = !usesGateway && input.channel === "POS";
    const paymentStatus = isImmediatePayment ? "SUCCESSFUL" : "PENDING";
    // A gateway payment is never instantly complete — completion (and, for
    // POS, marking the order COMPLETED) happens in finalizeGatewayPayment
    // once the gateway actually confirms the charge.
    const orderStatus = !usesGateway && input.channel === "POS" ? "COMPLETED" : "NEW";

    const order = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        channel: input.channel,
        customerId,
        cashierId: input.cashierId,
        status: orderStatus,
        fulfillmentType: input.fulfillmentType,
        deliveryAddress: input.deliveryAddress,
        scheduledFor: input.scheduledFor,
        subtotal,
        discountAmount,
        deliveryFee,
        totalAmount,
        paymentStatus,
        promotionCode: input.promotionCode,
        notes: input.notes,
        items: { create: resolvedLines },
      },
    });

    await tx.payment.create({
      data: {
        orderId: order.id,
        customerId,
        amount: totalAmount,
        method: input.paymentMethod,
        status: paymentStatus,
        paidAt: isImmediatePayment ? new Date() : null,
        transactionRef: input.transactionRef,
        gateway: input.gateway ?? "NONE",
        gatewayReference: usesGateway ? order.orderNumber : null,
      },
    });

    if (input.fulfillmentType === "DELIVERY") {
      await tx.delivery.create({
        data: {
          orderId: order.id,
          deliveryLocation: input.deliveryAddress ?? "",
          deliveryFee,
          scheduledAt: input.scheduledFor,
        },
      });
    }

    // Business rule: a completed sale must reduce relevant inventory. Online
    // orders reserve stock immediately too, so we don't oversell.
    await deductInventoryForSale(
      tx,
      resolvedLines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
      order.orderNumber,
      input.cashierId,
    );

    if (orderStatus === "COMPLETED") {
      await completeOrderCrmEffects(tx, order.id);
    }

    if (customerId && input.customer && input.channel === "ONLINE") {
      await tx.notification.create({
        data: {
          customerId,
          event: "ORDER_RECEIVED",
          channel: "SMS",
          message: `Hi ${input.customer.name}, we've received your order ${order.orderNumber}. We'll notify you as it progresses.`,
          status: "PENDING",
        },
      });
    }

    return order;
  });
}

/**
 * Called from a payment gateway's webhook/callback once it confirms the
 * final result of a charge. Idempotent: safe to call more than once for the
 * same reference (e.g. both a browser callback and a server webhook land)
 * — a payment already in a terminal state is left alone.
 */
export async function finalizeGatewayPayment(params: {
  gateway: Extract<PaymentGateway, "PAYSTACK" | "HUBTEL">;
  gatewayReference: string; // == orderNumber
  outcome: "SUCCESSFUL" | "FAILED";
  gatewayMeta?: unknown;
}): Promise<{ order: Order; alreadyFinalized: boolean } | null> {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findFirst({
      where: { gateway: params.gateway, gatewayReference: params.gatewayReference },
      orderBy: { createdAt: "desc" },
    });
    if (!payment) return null;

    const order = await tx.order.findUnique({ where: { id: payment.orderId } });
    if (!order) return null;

    if (payment.status === "SUCCESSFUL" || payment.status === "FAILED") {
      return { order, alreadyFinalized: true };
    }

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: params.outcome,
        paidAt: params.outcome === "SUCCESSFUL" ? new Date() : null,
        gatewayMeta: params.gatewayMeta ? JSON.stringify(params.gatewayMeta) : undefined,
      },
    });

    if (params.outcome === "FAILED") {
      await tx.order.update({ where: { id: order.id }, data: { paymentStatus: "FAILED" } });
      return { order, alreadyFinalized: false };
    }

    // SUCCESSFUL: a POS sale completes immediately on payment confirmation,
    // same as a manually-recorded POS payment would. An online order moves
    // from NEW to CONFIRMED — completion still follows the normal
    // production/delivery workflow via the Orders screen.
    const nextStatus = order.channel === "POS" ? "COMPLETED" : order.status === "NEW" ? "CONFIRMED" : order.status;
    await tx.order.update({
      where: { id: order.id },
      data: { paymentStatus: "SUCCESSFUL", status: nextStatus },
    });

    if (nextStatus === "COMPLETED") {
      await completeOrderCrmEffects(tx, order.id);
    }

    return { order: { ...order, status: nextStatus, paymentStatus: "SUCCESSFUL" }, alreadyFinalized: false };
  });
}
