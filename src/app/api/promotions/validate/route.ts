import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  const subtotal = typeof body?.subtotal === "number" ? body.subtotal : 0;

  if (!code) return NextResponse.json({ error: "Enter a code." }, { status: 400 });

  const promo = await prisma.promotion.findUnique({ where: { code } });
  const now = new Date();
  const valid =
    promo &&
    promo.isActive &&
    promo.startDate <= now &&
    (!promo.endDate || promo.endDate >= now) &&
    (!promo.usageLimit || promo.usedCount < promo.usageLimit) &&
    (!promo.minSpend || subtotal >= promo.minSpend);

  if (!valid) {
    return NextResponse.json({ error: "This code is invalid or not applicable to your order." }, { status: 400 });
  }

  let discount = 0;
  if (promo.type === "PERCENTAGE") discount = subtotal * (promo.value / 100);
  if (promo.type === "FIXED_AMOUNT") discount = Math.min(promo.value, subtotal);

  return NextResponse.json({ discount, type: promo.type, name: promo.name });
}
