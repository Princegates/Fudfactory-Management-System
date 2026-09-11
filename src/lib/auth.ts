import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";

export type StaffTokenPayload = {
  kind: "staff";
  id: string;
  name: string;
  email: string;
  role:
    | "SUPER_ADMIN"
    | "OWNER_MANAGER"
    | "CASHIER"
    | "INVENTORY_OFFICER"
    | "PRODUCTION_OFFICER"
    | "DELIVERY_OFFICER";
};

export type CustomerTokenPayload = {
  kind: "customer";
  id: string;
  name: string;
  phone: string;
};

export type TokenPayload = StaffTokenPayload | CustomerTokenPayload;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken<T extends TokenPayload = TokenPayload>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch {
    return null;
  }
}
