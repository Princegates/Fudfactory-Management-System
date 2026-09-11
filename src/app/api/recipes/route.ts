import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/session";

const ALLOWED_ROLES = ["SUPER_ADMIN", "OWNER_MANAGER", "PRODUCTION_OFFICER"];

export async function POST(request: NextRequest) {
  const session = await getStaffSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const productId = typeof body?.productId === "string" ? body.productId : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const yieldQuantity = Number(body?.yieldQuantity) || 1;
  const laborCost = Number(body?.laborCost) || 0;
  const packagingCost = Number(body?.packagingCost) || 0;
  const overheadCost = Number(body?.overheadCost) || 0;
  const items = Array.isArray(body?.items) ? body.items : [];

  if (!productId || !name || items.length === 0) {
    return NextResponse.json({ error: "Product, name and at least one ingredient are required." }, { status: 400 });
  }

  const recipe = await prisma.recipe.create({
    data: {
      productId,
      name,
      yieldQuantity,
      laborCost,
      packagingCost,
      overheadCost,
      items: {
        create: items.map((i: { ingredientId: string; quantityPerYield: number }) => ({
          ingredientId: i.ingredientId,
          quantityPerYield: Number(i.quantityPerYield),
        })),
      },
    },
  });

  return NextResponse.json(recipe);
}
