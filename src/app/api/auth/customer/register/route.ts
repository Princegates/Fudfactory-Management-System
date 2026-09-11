import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { CUSTOMER_COOKIE } from "@/lib/session";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : undefined;
  const password = typeof body?.password === "string" ? body.password : "";
  const address = typeof body?.address === "string" ? body.address.trim() : undefined;

  if (!name || !phone || password.length < 6) {
    return NextResponse.json(
      { error: "Name, phone and a password of at least 6 characters are required." },
      { status: 400 },
    );
  }

  const existing = await prisma.customer.findUnique({ where: { phone } });
  if (existing) {
    return NextResponse.json({ error: "An account with this phone number already exists." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const customer = await prisma.customer.create({
    data: { name, phone, email, address, passwordHash },
  });

  const token = signToken({ kind: "customer", id: customer.id, name: customer.name, phone: customer.phone });
  const response = NextResponse.json({ id: customer.id, name: customer.name });
  response.cookies.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
