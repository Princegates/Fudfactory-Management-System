import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  CustomerTokenPayload,
  StaffTokenPayload,
  verifyToken,
} from "./auth";

export const STAFF_COOKIE = "ff_staff_session";
export const CUSTOMER_COOKIE = "ff_customer_session";

export async function getStaffSession(): Promise<StaffTokenPayload | null> {
  const store = await cookies();
  const token = store.get(STAFF_COOKIE)?.value;
  if (!token) return null;
  const payload = verifyToken<StaffTokenPayload>(token);
  if (!payload || payload.kind !== "staff") return null;
  return payload;
}

export async function getCustomerSession(): Promise<CustomerTokenPayload | null> {
  const store = await cookies();
  const token = store.get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  const payload = verifyToken<CustomerTokenPayload>(token);
  if (!payload || payload.kind !== "customer") return null;
  return payload;
}

/** Server-component guard: redirects to staff login if not authenticated,
 * or to the portal home if authenticated but lacking one of the allowed roles. */
export async function requireStaff(
  allowedRoles?: StaffTokenPayload["role"][],
): Promise<StaffTokenPayload> {
  const session = await getStaffSession();
  if (!session) redirect("/portal/login");
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    redirect("/portal?denied=1");
  }
  return session;
}

export async function requireCustomer(): Promise<CustomerTokenPayload> {
  const session = await getCustomerSession();
  if (!session) redirect("/account/login");
  return session;
}
