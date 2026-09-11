import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/session";
import { recordStockMovement } from "@/lib/inventory";

const ALLOWED_ROLES = ["SUPER_ADMIN", "OWNER_MANAGER", "INVENTORY_OFFICER"];

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getStaffSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const type = body?.type;
  const note = typeof body?.note === "string" ? body.note.trim() : undefined;
  const rawQuantity = Number(body?.quantity);

  if (!Number.isFinite(rawQuantity)) {
    return NextResponse.json({ error: "Enter a valid quantity." }, { status: 400 });
  }

  const item = await prisma.inventoryItem.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Item not found." }, { status: 404 });

  let delta: number;
  switch (type) {
    case "RECEIPT":
      delta = Math.abs(rawQuantity);
      break;
    case "ISSUE":
    case "TRANSFER":
      delta = -Math.abs(rawQuantity);
      break;
    case "COUNT":
      delta = rawQuantity - item.currentStock; // rawQuantity is the counted absolute stock level
      break;
    case "ADJUSTMENT":
      delta = rawQuantity; // signed value entered directly
      break;
    default:
      return NextResponse.json({ error: "Invalid movement type." }, { status: 400 });
  }

  if (item.currentStock + delta < 0) {
    return NextResponse.json({ error: "This movement would make stock negative." }, { status: 400 });
  }

  await prisma.$transaction((tx) =>
    recordStockMovement(tx, {
      itemId: id,
      type,
      quantity: delta,
      note,
      userId: session.id,
    }),
  );

  return NextResponse.json({ ok: true });
}
