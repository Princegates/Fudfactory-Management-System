import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/session";

export async function PATCH(request: NextRequest) {
  const session = await getStaffSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const fields = ["businessName", "tagline", "phone", "whatsapp", "email", "address", "instagramHandle", "facebookUrl", "aboutText", "heroImageUrl"];
  const data: Record<string, unknown> = {};
  for (const field of fields) {
    if (typeof body?.[field] === "string") data[field] = body[field];
  }

  const profile = await prisma.businessProfile.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  });

  return NextResponse.json(profile);
}
