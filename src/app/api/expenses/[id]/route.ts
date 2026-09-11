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
  if (typeof body?.category === "string") data.category = body.category.trim();
  if (typeof body?.description === "string") data.description = body.description.trim() || null;
  if (typeof body?.amount === "number" && body.amount >= 0) data.amount = body.amount;
  if (typeof body?.expenseDate === "string") data.expenseDate = new Date(body.expenseDate);

  const expense = await prisma.expense.update({ where: { id }, data });
  return NextResponse.json(expense);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getStaffSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { id } = await params;
  await prisma.expense.delete({ where: { id } });
  await logAudit({ userId: session.id, action: "EXPENSE_DELETE", entityType: "Expense", entityId: id });
  return NextResponse.json({ ok: true });
}
