import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/session";

const ALLOWED_ROLES = ["SUPER_ADMIN", "OWNER_MANAGER", "INVENTORY_OFFICER"];

export async function POST(request: NextRequest) {
  const session = await getStaffSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "Supplier name is required." }, { status: 400 });

  const supplier = await prisma.supplier.create({
    data: {
      name,
      phone: body?.phone || undefined,
      email: body?.email || undefined,
      address: body?.address || undefined,
      itemsSupplied: body?.itemsSupplied || undefined,
    },
  });
  return NextResponse.json(supplier);
}
