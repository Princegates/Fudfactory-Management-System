import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/session";
import { generateCode } from "@/lib/format";

const ALLOWED_ROLES = ["SUPER_ADMIN", "OWNER_MANAGER", "PRODUCTION_OFFICER"];

export async function POST(request: NextRequest) {
  const session = await getStaffSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const items = Array.isArray(body?.items) ? body.items : [];
  const notes = typeof body?.notes === "string" ? body.notes.trim() : undefined;
  const plannedDate = body?.plannedDate ? new Date(body.plannedDate) : new Date();

  if (items.length === 0) {
    return NextResponse.json({ error: "Add at least one product to produce." }, { status: 400 });
  }

  const order = await prisma.productionOrder.create({
    data: {
      code: generateCode("PRD"),
      plannedDate,
      notes,
      createdById: session.id,
      items: {
        create: items.map((i: { productId: string; recipeId?: string; quantityPlanned: number }) => ({
          productId: i.productId,
          recipeId: i.recipeId || undefined,
          quantityPlanned: Number(i.quantityPlanned),
        })),
      },
    },
  });

  return NextResponse.json(order);
}
