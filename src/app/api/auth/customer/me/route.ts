import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/session";

export async function GET() {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ customer: null });

  const customer = await prisma.customer.findUnique({ where: { id: session.id } });
  if (!customer) return NextResponse.json({ customer: null });

  return NextResponse.json({
    customer: {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      loyaltyPoints: customer.loyaltyPoints,
    },
  });
}
