import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { Reveal } from "@/components/site/Reveal";

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
    <div className="relative">
      <div className="aurora-bg opacity-30" />
      <div className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <Reveal>
          <h1 className="font-display text-4xl font-bold" style={{ color: "var(--text-hi)" }}>
            Promotions &amp; <span className="text-gradient">Offers</span>
          </h1>
          <p className="mt-2" style={{ color: "var(--text-mid)" }}>
            Apply a coupon code at checkout to enjoy these current offers.
          </p>
        </Reveal>

        {promotions.length > 0 ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {promotions.map((promo, i) => (
              <Reveal key={promo.id} delay={i * 0.06}>
                <div className="glass glow-card relative overflow-hidden rounded-2xl p-6">
                  <p className="font-display text-xl font-bold text-gradient">{describeValue(promo.type, promo.value)}</p>
                  <p className="mt-1 font-semibold" style={{ color: "var(--text-hi)" }}>{promo.name}</p>
                  {promo.description && (
                    <p className="mt-1 text-sm" style={{ color: "var(--text-mid)" }}>{promo.description}</p>
                  )}
                  {promo.code && (
                    <p
                      className="mt-4 inline-block rounded-full border border-dashed px-4 py-1.5 font-mono text-sm font-bold"
                      style={{ borderColor: "var(--glow-amber)", color: "var(--glow-amber)" }}
                    >
                      {promo.code}
                    </p>
                  )}
                  {promo.minSpend && (
                    <p className="mt-3 text-xs" style={{ color: "var(--text-lo)" }}>Minimum spend {formatCurrency(promo.minSpend)}</p>
                  )}
                  {promo.endDate && (
                    <p className="mt-1 text-xs" style={{ color: "var(--text-lo)" }}>Valid until {formatDate(promo.endDate)}</p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="mt-16 text-center" style={{ color: "var(--text-lo)" }}>
            No active promotions right now — check back soon!
          </p>
        )}
      </div>
    </div>
  );
}
