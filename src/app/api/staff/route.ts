import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/session";
import { hashPassword } from "@/lib/auth";

const ROLES = ["SUPER_ADMIN", "OWNER_MANAGER", "CASHIER", "INVENTORY_OFFICER", "PRODUCTION_OFFICER", "DELIVERY_OFFICER"];

export async function POST(request: NextRequest) {
  const session = await getStaffSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : undefined;
  const department = typeof body?.department === "string" ? body.department.trim() : undefined;
  const role = ROLES.includes(body?.role) ? body.role : "CASHIER";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name || !email || password.length < 6) {
    return NextResponse.json({ error: "Name, email and a password of at least 6 characters are required." }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  try {
    const user = await prisma.user.create({
      data: { name, email, phone, department, role, passwordHash },
    });
    return NextResponse.json({ id: user.id });
  } catch {
    return NextResponse.json({ error: "A staff account with this email already exists." }, { status: 409 });
  }
}
