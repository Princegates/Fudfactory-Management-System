import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";

const ALLOWED_ROLES = ["SUPER_ADMIN", "OWNER_MANAGER", "PRODUCTION_OFFICER"];

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getStaffSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { id } = await params;
  const productionUses = await prisma.productionItem.count({ where: { recipeId: id } });
  if (productionUses > 0) {
    return NextResponse.json({ error: "This recipe has production history and can't be deleted." }, { status: 409 });
  }

  await prisma.recipe.delete({ where: { id } });
  await logAudit({ userId: session.id, action: "RECIPE_DELETE", entityType: "Recipe", entityId: id });
  return NextResponse.json({ ok: true });
}
