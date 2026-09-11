import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "You must be logged in to leave a review." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const orderId = typeof body?.orderId === "string" ? body.orderId : "";
  const rating = Number(body?.rating);
  const comment = typeof body?.comment === "string" ? body.comment.trim() : undefined;

  if (!orderId || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "A valid order and rating (1-5) are required." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.customerId !== session.id) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (order.status !== "COMPLETED") {
    return NextResponse.json({ error: "You can only review completed orders." }, { status: 400 });
  }

  const existing = await prisma.review.findFirst({ where: { orderId, customerId: session.id } });
  if (existing) {
    return NextResponse.json({ error: "You've already reviewed this order." }, { status: 409 });
  }

  const review = await prisma.review.create({
    data: { customerId: session.id, orderId, rating, comment },
  });

  return NextResponse.json({ id: review.id });
}
