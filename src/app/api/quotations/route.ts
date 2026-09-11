import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCode } from "@/lib/format";
import { getCustomerSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const customerName = typeof body?.customerName === "string" ? body.customerName.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : undefined;
  const eventType = typeof body?.eventType === "string" ? body.eventType.trim() : "";
  const eventDate = typeof body?.eventDate === "string" && body.eventDate ? new Date(body.eventDate) : undefined;
  const guestCount = typeof body?.guestCount === "number" ? body.guestCount : undefined;
  const requirements = typeof body?.requirements === "string" ? body.requirements.trim() : undefined;

  if (!customerName || !phone || !eventType) {
    return NextResponse.json({ error: "Name, phone and event type are required." }, { status: 400 });
  }

  const session = await getCustomerSession();

  const quotation = await prisma.quotation.create({
    data: {
      code: generateCode("QT"),
      customerId: session?.id,
      customerName,
      phone,
      email,
      eventType,
      eventDate,
      guestCount,
      requirements,
      items: "[]",
    },
  });

  return NextResponse.json({ code: quotation.code });
}
