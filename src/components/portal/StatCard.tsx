export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "warning";
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        tone === "warning" ? "border-amber-300 bg-amber-50" : "border-brand-100 bg-white"
      }`}
    >
      <p className="text-sm font-medium text-cocoa-900/60">{label}</p>
      <p className="mt-1 text-2xl font-bold text-cocoa-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-cocoa-900/50">{hint}</p>}
    </div>
  );
}
