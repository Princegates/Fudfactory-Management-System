import { NextRequest, NextResponse } from "next/server";

// Optimistic, cookie-presence-only gate for the staff portal. This does not
// verify the JWT (Proxy should not run heavy logic) — full verification and
// role checks happen in each server component via requireStaff().
const STAFF_COOKIE = "ff_staff_session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lets a deployment show only the public ordering site, with the staff
  // portal completely unreachable (e.g. a client-facing preview link).
  if (process.env.NEXT_PUBLIC_HIDE_STAFF_PORTAL === "true" && pathname.startsWith("/portal")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

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
