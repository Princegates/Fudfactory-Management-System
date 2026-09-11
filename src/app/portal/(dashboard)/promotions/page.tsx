import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { QuickCreateForm } from "@/components/portal/QuickCreateForm";
import { PromotionRowControls } from "@/components/portal/PromotionRowControls";

export default async function PromotionsPage() {
  await requireStaff(["SUPER_ADMIN", "OWNER_MANAGER"]);
  const promotions = await prisma.promotion.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-cocoa-900">Promotions &amp; Coupons</h1>
        <QuickCreateForm
          action="/api/promotions"
          buttonLabel="+ New Promotion"
          fields={[
            { name: "name", label: "Promotion name", required: true },
            { name: "code", label: "Coupon code (optional)" },
            { name: "type", label: "Type", type: "select", required: true, options: [
              { value: "PERCENTAGE", label: "Percentage discount" },
              { value: "FIXED_AMOUNT", label: "Fixed amount off" },
              { value: "BOGO", label: "Buy one get one" },
              { value: "COMBO", label: "Combo offer" },
            ] },
            { name: "value", label: "Value (% or GHS)", type: "number", step: "0.01" },
            { name: "minSpend", label: "Minimum spend (optional)", type: "number", step: "0.01" },
            { name: "startDate", label: "Start date", type: "date" },
            { name: "endDate", label: "End date (optional)", type: "date" },
            { name: "description", label: "Description", type: "textarea" },
          ]}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {promotions.map((promo) => (
          <div key={promo.id} className="rounded-2xl border border-brand-100 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="font-bold text-cocoa-900">{promo.name}</p>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${promo.isActive ? "bg-green-100 text-green-700" : "bg-cocoa-50 text-cocoa-900/60"}`}>
                {promo.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="mt-1 text-sm text-cocoa-900/60">{promo.type.replace(/_/g, " ")} · {promo.value}{promo.type === "PERCENTAGE" ? "%" : ""}</p>
            {promo.code && <p className="mt-1 font-mono text-sm text-brand-700">{promo.code}</p>}
            <p className="mt-2 text-xs text-cocoa-900/50">
              {formatDate(promo.startDate)} {promo.endDate ? `– ${formatDate(promo.endDate)}` : "onward"} · Used {promo.usedCount}{promo.usageLimit ? `/${promo.usageLimit}` : ""}
            </p>
            {promo.minSpend && <p className="mt-1 text-xs text-cocoa-900/50">Min spend {formatCurrency(promo.minSpend)}</p>}
            <PromotionRowControls promotionId={promo.id} isActive={promo.isActive} />
          </div>
        ))}
        {promotions.length === 0 && <p className="text-sm text-cocoa-900/50">No promotions yet.</p>}
      </div>
    </div>
  );
}
