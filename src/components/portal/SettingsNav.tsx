"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SettingsNavItem = { href: string; label: string; icon: string };

export const SETTINGS_NAV: SettingsNavItem[] = [
  { href: "/portal/settings", label: "General Settings", icon: "⚙️" },
  { href: "/portal/settings/payment-methods", label: "Payment Methods", icon: "💳" },
  { href: "/portal/settings/notifications", label: "Notification Setting", icon: "🔔" },
  { href: "/portal/settings/whatsapp", label: "WhatsApp Messaging", icon: "💬" },
  { href: "/portal/settings/sms", label: "SMS Setting", icon: "✉️" },
  { href: "/portal/settings/email", label: "Email Setting", icon: "📧" },
  { href: "/portal/settings/receipts", label: "Print / Receipt Setting", icon: "🧾" },
  { href: "/portal/settings/website", label: "Website (Front CMS)", icon: "🌐" },
  { href: "/portal/settings/themes", label: "Themes", icon: "🎨" },
  { href: "/portal/settings/roles-permissions", label: "Roles & Permissions", icon: "🔐" },
  { href: "/portal/settings/currency", label: "Currency", icon: "💰" },
  { href: "/portal/settings/backup-restore", label: "Backup & Restore", icon: "🗄️" },
  { href: "/portal/staff", label: "Users", icon: "👤" },
];

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0.5">
      {SETTINGS_NAV.map((item) => {
        const active = item.href === "/portal/settings" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
              active ? "bg-brand-500 text-white" : "text-cocoa-900/80 hover:bg-brand-50"
            }`}
          >
            <span className="text-base leading-none">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
