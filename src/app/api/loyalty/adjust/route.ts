import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/session";

const ALLOWED_ROLES = ["SUPER_ADMIN", "OWNER_MANAGER"];

export async function POST(request: NextRequest) {
  const session = await getStaffSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const points = Number(body?.points);
  const description = typeof body?.description === "string" ? body.description.trim() : "Manual adjustment";

  if (!phone || !Number.isFinite(points) || points === 0) {
    return NextResponse.json({ error: "A customer phone and non-zero points value are required." }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({ where: { phone } });
  if (!customer) return NextResponse.json({ error: "Customer not found." }, { status: 404 });

  await prisma.$transaction([
    prisma.customer.update({ where: { id: customer.id }, data: { loyaltyPoints: { increment: points } } }),
    prisma.loyaltyTransaction.create({
      data: { customerId: customer.id, points, type: "ADJUSTMENT", description },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
