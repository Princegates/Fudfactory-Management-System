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
  const category = typeof body?.category === "string" ? body.category.trim() : "";
  const amount = Number(body?.amount);
  const description = typeof body?.description === "string" ? body.description.trim() : undefined;
  const expenseDate = body?.expenseDate ? new Date(body.expenseDate) : new Date();

  if (!category || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Category and a positive amount are required." }, { status: 400 });
  }

  const expense = await prisma.expense.create({
    data: { category, amount, description, expenseDate, recordedById: session.id },
  });

  return NextResponse.json(expense);
}
