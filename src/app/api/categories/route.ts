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
  if (!name) return NextResponse.json({ error: "Category name is required." }, { status: 400 });

  try {
    const category = await prisma.category.create({ data: { name, slug: slugify(name) } });
    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "A category with this name already exists." }, { status: 409 });
  }
}
