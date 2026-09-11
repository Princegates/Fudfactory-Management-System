import { StaffTokenPayload } from "./auth";

export type StaffRole = StaffTokenPayload["role"];

export const ALL_ROLES: StaffRole[] = [
  "SUPER_ADMIN",
  "OWNER_MANAGER",
  "CASHIER",
  "INVENTORY_OFFICER",
  "PRODUCTION_OFFICER",
  "DELIVERY_OFFICER",
];

export type NavItem = {
  href: string;
  label: string;
  roles: StaffRole[];
};

// Section 4 of the SRS maps each staff role to the modules it may use.
// SUPER_ADMIN always has full access.
export const PORTAL_NAV: NavItem[] = [
  { href: "/portal", label: "Dashboard", roles: ALL_ROLES },
  { href: "/portal/pos", label: "Point of Sale", roles: ["SUPER_ADMIN", "OWNER_MANAGER", "CASHIER"] },
  { href: "/portal/products", label: "Menu / Products", roles: ["SUPER_ADMIN", "OWNER_MANAGER"] },
  { href: "/portal/orders", label: "Orders", roles: ["SUPER_ADMIN", "OWNER_MANAGER", "CASHIER", "DELIVERY_OFFICER"] },
  { href: "/portal/customers", label: "Customers / CRM", roles: ["SUPER_ADMIN", "OWNER_MANAGER", "CASHIER"] },
  { href: "/portal/inventory", label: "Inventory", roles: ["SUPER_ADMIN", "OWNER_MANAGER", "INVENTORY_OFFICER"] },
  { href: "/portal/suppliers", label: "Suppliers", roles: ["SUPER_ADMIN", "OWNER_MANAGER", "INVENTORY_OFFICER"] },
  { href: "/portal/recipes", label: "Recipes / BOM", roles: ["SUPER_ADMIN", "OWNER_MANAGER", "PRODUCTION_OFFICER"] },
  { href: "/portal/production", label: "Production", roles: ["SUPER_ADMIN", "OWNER_MANAGER", "PRODUCTION_OFFICER"] },
  { href: "/portal/deliveries", label: "Deliveries", roles: ["SUPER_ADMIN", "OWNER_MANAGER", "DELIVERY_OFFICER"] },
  { href: "/portal/payments", label: "Payments", roles: ["SUPER_ADMIN", "OWNER_MANAGER", "CASHIER"] },
  { href: "/portal/expenses", label: "Expenses", roles: ["SUPER_ADMIN", "OWNER_MANAGER"] },
  { href: "/portal/quotations", label: "Quotations", roles: ["SUPER_ADMIN", "OWNER_MANAGER"] },
  { href: "/portal/promotions", label: "Promotions & Coupons", roles: ["SUPER_ADMIN", "OWNER_MANAGER"] },
  { href: "/portal/loyalty", label: "Loyalty Program", roles: ["SUPER_ADMIN", "OWNER_MANAGER"] },
  { href: "/portal/reports", label: "Reports & Analytics", roles: ["SUPER_ADMIN", "OWNER_MANAGER"] },
  { href: "/portal/reviews", label: "Reviews", roles: ["SUPER_ADMIN", "OWNER_MANAGER"] },
  { href: "/portal/staff", label: "Staff Management", roles: ["SUPER_ADMIN"] },
  { href: "/portal/settings", label: "Business Settings", roles: ["SUPER_ADMIN"] },
  { href: "/portal/audit-log", label: "Audit Log", roles: ["SUPER_ADMIN"] },
];

export function canAccess(role: StaffRole, href: string): boolean {
  const item = PORTAL_NAV.find((i) => i.href === href);
  if (!item) return true;
  return item.roles.includes(role);
}

export function navFor(role: StaffRole): NavItem[] {
  return PORTAL_NAV.filter((item) => item.roles.includes(role));
}
