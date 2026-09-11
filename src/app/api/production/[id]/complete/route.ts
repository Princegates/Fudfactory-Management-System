import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/session";
import { completeProductionOrder } from "@/lib/production";

const ALLOWED_ROLES = ["SUPER_ADMIN", "OWNER_MANAGER", "PRODUCTION_OFFICER"];

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getStaffSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { id } = await params;
  try {
    await completeProductionOrder(id, session.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not complete production.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
