import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const quotation = await prisma.quotation.findUnique({ where: { code } });
  if (!quotation) return NextResponse.json({ error: "Quotation not found." }, { status: 404 });
  if (quotation.status !== "SENT") {
    return NextResponse.json(
      { error: "This quotation cannot be accepted in its current state." },
      { status: 400 },
    );
  }

  const updated = await prisma.quotation.update({ where: { code }, data: { status: "ACCEPTED" } });
  return NextResponse.json({ status: updated.status });
}
