import { NextResponse } from "next/server";
import { STAFF_COOKIE } from "@/lib/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(STAFF_COOKIE);
  return response;
}
