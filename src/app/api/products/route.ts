import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/session";
import { slugify } from "@/lib/format";

const ALLOWED_ROLES = ["SUPER_ADMIN", "OWNER_MANAGER"];

export async function POST(request: NextRequest) {
  const session = await getStaffSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const categoryId = typeof body?.categoryId === "string" ? body.categoryId : "";
  const price = Number(body?.price);
  const description = typeof body?.description === "string" ? body.description.trim() : undefined;
  const imageUrl = typeof body?.imageUrl === "string" && body.imageUrl.trim() ? body.imageUrl.trim() : undefined;
  const isFeatured = Boolean(body?.isFeatured);

  if (!name || !categoryId || !Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: "Name, category and a valid price are required." }, { status: 400 });
  }

  try {
    const product = await prisma.product.create({
      data: { name, slug: slugify(name), categoryId, price, description, imageUrl, isFeatured },
    });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "A product with this name already exists." }, { status: 409 });
  }
}
