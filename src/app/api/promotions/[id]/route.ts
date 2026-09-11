import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";

const ALLOWED_ROLES = ["SUPER_ADMIN", "OWNER_MANAGER"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getStaffSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const data: Record<string, unknown> = {};
  if (typeof body?.name === "string") data.name = body.name.trim();
  if (typeof body?.value === "number") data.value = body.value;
  if (typeof body?.minSpend === "number") data.minSpend = body.minSpend;
  if (typeof body?.description === "string") data.description = body.description.trim() || null;
  if (typeof body?.isActive === "boolean") data.isActive = body.isActive;

  const promotion = await prisma.promotion.update({ where: { id }, data });
  return NextResponse.json(promotion);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getStaffSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { id } = await params;
  await prisma.promotion.delete({ where: { id } });
  await logAudit({ userId: session.id, action: "PROMOTION_DELETE", entityType: "Promotion", entityId: id });
  return NextResponse.json({ ok: true });
}
