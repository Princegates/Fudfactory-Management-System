import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";

const SEGMENTS = ["NEW", "REGULAR", "VIP", "CORPORATE", "EVENT", "INACTIVE"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);

  const data: Record<string, unknown> = {};
  if (typeof body?.name === "string") data.name = body.name.trim();
  if (typeof body?.email === "string") data.email = body.email.trim();
  if (typeof body?.address === "string") data.address = body.address.trim();
  if (SEGMENTS.includes(body?.segment)) data.segment = body.segment;

  const customer = await prisma.customer.update({ where: { id }, data });

  await logAudit({ userId: session.id, action: "CUSTOMER_UPDATE", entityType: "Customer", entityId: id, details: data });

  return NextResponse.json(customer);
}
