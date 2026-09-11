import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

export default async function AuditLogPage() {
  await requireStaff(["SUPER_ADMIN"]);
  const logs = await prisma.auditLog.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-cocoa-900">Audit Log</h1>
      <p className="mt-1 text-sm text-cocoa-900/60">Financial transactions, inventory adjustments, price changes and administrative actions.</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-100 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-brand-100 text-left text-cocoa-900/50">
              <th className="p-3">Date</th>
              <th className="p-3">User</th>
              <th className="p-3">Action</th>
              <th className="p-3">Entity</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-brand-50">
                <td className="p-3 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                <td className="p-3">{log.user?.name ?? "System"}</td>
                <td className="p-3">{log.action}</td>
                <td className="p-3">{log.entityType}{log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}</td>
                <td className="p-3 text-xs text-cocoa-900/60">{log.details ?? "—"}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-cocoa-900/50">No audit entries yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
