import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/session";

/** Polling endpoint for pending gateway payments — used by the POS terminal
 * (staff session) and the online checkout confirmation page (phone match). */
export async function GET(request: NextRequest, { params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const phone = request.nextUrl.searchParams.get("phone");

  const staffSession = await getStaffSession();
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { customer: true, payments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (!staffSession && (!phone || order.customer?.phone !== phone)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  return NextResponse.json({
    orderStatus: order.status,
    paymentStatus: order.paymentStatus,
    latestPaymentStatus: order.payments[0]?.status ?? null,
    totalAmount: order.totalAmount,
  });
}
