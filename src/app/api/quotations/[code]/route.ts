import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/session";

const ALLOWED_ROLES = ["SUPER_ADMIN", "OWNER_MANAGER"];

export async function GET(_request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const quotation = await prisma.quotation.findUnique({ where: { code } });
  if (!quotation) return NextResponse.json({ error: "Quotation not found." }, { status: 404 });
  return NextResponse.json({
    ...quotation,
    items: JSON.parse(quotation.items),
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const session = await getStaffSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { code } = await params;
  const body = await request.json().catch(() => null);
  const items: { description: string; quantity: number; unitPrice: number }[] = Array.isArray(body?.items)
    ? body.items
    : [];
  const deliveryFee = Number(body?.deliveryFee) || 0;
  const itemsTotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const totalAmount = itemsTotal + deliveryFee;

  const data: Record<string, unknown> = {
    items: JSON.stringify(items),
    deliveryFee,
    totalAmount,
  };
  if (body?.status === "SENT") data.status = "SENT";

  const quotation = await prisma.quotation.update({ where: { code }, data });
  return NextResponse.json(quotation);
}
