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
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const type = ["PERCENTAGE", "FIXED_AMOUNT", "BOGO", "COMBO"].includes(body?.type) ? body.type : "PERCENTAGE";
  const value = Number(body?.value) || 0;
  const code = typeof body?.code === "string" && body.code.trim() ? body.code.trim().toUpperCase() : undefined;
  const minSpend = body?.minSpend ? Number(body.minSpend) : undefined;
  const startDate = body?.startDate ? new Date(body.startDate) : new Date();
  const endDate = body?.endDate ? new Date(body.endDate) : undefined;
  const description = typeof body?.description === "string" ? body.description.trim() : undefined;

  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });

  try {
    const promo = await prisma.promotion.create({
      data: { name, type, value, code, minSpend, startDate, endDate, description },
    });
    return NextResponse.json(promo);
  } catch {
    return NextResponse.json({ error: "A promotion with this code already exists." }, { status: 409 });
  }
}
