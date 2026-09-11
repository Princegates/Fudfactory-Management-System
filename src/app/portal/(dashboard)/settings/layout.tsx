import { requireStaff } from "@/lib/session";
import { SettingsNav } from "@/components/portal/SettingsNav";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  await requireStaff(["SUPER_ADMIN"]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-cocoa-900">System Settings</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-2xl border border-brand-100 bg-white p-3 lg:sticky lg:top-6">
          <SettingsNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
