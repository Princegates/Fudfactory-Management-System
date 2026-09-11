import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Promotions",
  description: "Current discounts, coupon codes and seasonal offers from FudFactory.",
};

function describeValue(type: string, value: number) {
  if (type === "PERCENTAGE") return `${value}% off`;
  if (type === "FIXED_AMOUNT") return `${formatCurrency(value)} off`;
  if (type === "BOGO") return "Buy one, get one";
  return "Combo offer";
}

export default async function PromotionsPage() {
  const now = new Date();
  const promotions = await prisma.promotion.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      OR: [{ endDate: null }, { endDate: { gte: now } }],
    },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-cocoa-900">Promotions &amp; Offers</h1>
      <p className="mt-2 text-cocoa-900/70">Apply a coupon code at checkout to enjoy these current offers.</p>

      {promotions.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {promotions.map((promo) => (
            <div key={promo.id} className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
              <p className="text-lg font-bold text-brand-700">{describeValue(promo.type, promo.value)}</p>
              <p className="mt-1 font-semibold text-cocoa-900">{promo.name}</p>
              {promo.description && <p className="mt-1 text-sm text-cocoa-900/70">{promo.description}</p>}
              {promo.code && (
                <p className="mt-3 inline-block rounded-full border border-dashed border-brand-400 bg-white px-4 py-1 font-mono text-sm font-bold text-brand-700">
                  {promo.code}
                </p>
              )}
              {promo.minSpend && (
                <p className="mt-2 text-xs text-cocoa-900/60">Minimum spend {formatCurrency(promo.minSpend)}</p>
              )}
              {promo.endDate && (
                <p className="mt-1 text-xs text-cocoa-900/60">Valid until {formatDate(promo.endDate)}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-10 text-center text-cocoa-900/60">No active promotions right now — check back soon!</p>
      )}
    </div>
  );
}
