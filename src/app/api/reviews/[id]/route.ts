import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/session";

const ALLOWED_ROLES = ["SUPER_ADMIN", "OWNER_MANAGER"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getStaffSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const review = await prisma.review.update({ where: { id }, data: { isApproved: Boolean(body?.isApproved) } });
  return NextResponse.json(review);
}
