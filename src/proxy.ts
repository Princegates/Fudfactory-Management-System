import { NextRequest, NextResponse } from "next/server";

// Optimistic, cookie-presence-only gate for the staff portal. This does not
// verify the JWT (Proxy should not run heavy logic) — full verification and
// role checks happen in each server component via requireStaff().
const STAFF_COOKIE = "ff_staff_session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/portal") && pathname !== "/portal/login") {
    const hasSession = request.cookies.has(STAFF_COOKIE);
    if (!hasSession) {
      const loginUrl = new URL("/portal/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*"],
};
