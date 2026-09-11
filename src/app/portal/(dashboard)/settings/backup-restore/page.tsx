import { requireStaff } from "@/lib/session";

export default async function BackupRestorePage() {
  await requireStaff(["SUPER_ADMIN"]);

  return (
    <div>
      <h2 className="text-lg font-bold text-cocoa-900">Backup &amp; Restore</h2>
      <p className="mt-1 text-sm text-cocoa-900/60">
        Export your business data as a JSON file for safekeeping.
      </p>

      <div className="mt-6 max-w-2xl space-y-6">
        <div className="rounded-2xl border border-brand-100 bg-white p-5">
          <h3 className="font-bold text-cocoa-900">Export backup</h3>
          <p className="mt-1 text-sm text-cocoa-900/60">
            Downloads categories, products, customers, suppliers, inventory, recipes, production
            orders, sales orders, payments, expenses, promotions and quotations. Staff accounts and
            passwords are never included.
          </p>
          <a
            href="/api/settings/backup"
            className="mt-4 inline-block rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Download Backup (JSON) ↓
          </a>
        </div>

        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <h3 className="font-bold text-cocoa-900">Restore</h3>
          <p className="mt-1 text-sm text-cocoa-900/80">
            Restoring from a backup file isn&apos;t available in this version — re-importing data
            safely (without duplicating or overwriting live orders) needs more validation than a
            simple upload. If you need to restore from a backup, back up the current database file
            first, then ask your developer to restore it directly at the database level.
          </p>
        </div>
      </div>
    </div>
  );
}
