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
  if (typeof body?.price === "number") data.price = body.price;
  if (typeof body?.description === "string") data.description = body.description;
  if (typeof body?.imageUrl === "string") data.imageUrl = body.imageUrl || null;
  if (typeof body?.isAvailable === "boolean") data.isAvailable = body.isAvailable;
  if (typeof body?.isFeatured === "boolean") data.isFeatured = body.isFeatured;
  if (typeof body?.categoryId === "string") data.categoryId = body.categoryId;

  const product = await prisma.product.update({ where: { id }, data });
  return NextResponse.json(product);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getStaffSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { id } = await params;
  const [orderItemCount, productionItemCount] = await Promise.all([
    prisma.orderItem.count({ where: { productId: id } }),
    prisma.productionItem.count({ where: { productId: id } }),
  ]);
  if (orderItemCount > 0) {
    return NextResponse.json(
      { error: "This product has order history — mark it unavailable instead of deleting it." },
      { status: 409 },
    );
  }
  if (productionItemCount > 0) {
    return NextResponse.json(
      { error: "This product has production history — mark it unavailable instead of deleting it." },
      { status: 409 },
    );
  }

  await prisma.$transaction([
    prisma.recipe.deleteMany({ where: { productId: id } }),
    prisma.inventoryItem.deleteMany({ where: { productId: id } }),
    prisma.review.deleteMany({ where: { productId: id } }),
    prisma.product.delete({ where: { id } }),
  ]);
  await logAudit({ userId: session.id, action: "PRODUCT_DELETE", entityType: "Product", entityId: id });
  return NextResponse.json({ ok: true });
}
